import { Injectable, Logger } from '@nestjs/common';
import { modifyThsSelfRequest, modifyThsSelfStocksRequest, fetchNewsRequest } from '../core/fetchUtil';
import { AsynTaskIterator, dailyLimitOptionalStrategy } from 'pay-back-core';
import { UsersService } from '../../users/users.service';
import { SystemConfigService } from './systemConfig.service';
import { dealResultIsLogin, dealPlateResult, atob } from '../utils/thsUtils';
import { QyWechatNotice } from './qyWechatNotice.service';

let isSuccess = true;

function prepareSelfStock(i, stocks, app, userid, ticket, user, account) {
  if (stocks) {
    for (let j = 0; j < stocks.length; j++) {
      // 仅插入 10cm的个股
      dailyLimitOptionalStrategy(stocks[j], i) &&
        app.add(async (ctx, next) => {
          const result = await modifyThsSelfStocksRequest(stocks[j].code, userid, ticket, user);
          // console.log(stocks[j].name, result);
          isSuccess = dealResultIsLogin(result, ctx, account);
          isSuccess && next();
        });
    }
  }
}
@Injectable()
export class ThsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly systemConfigService: SystemConfigService,
    private readonly qyWechatNotice: QyWechatNotice,
  ) { }

  private readonly logger = new Logger(ThsService.name);
  private latestTime: string = Math.round(new Date().getTime() / 1000).toString();

  /**
   * 自动添加 同花顺 自选个股
   * @param evenBoardData
   * @returns
   */
  async autoModifyThsSelfStocks(evenBoardData, account) {
    // 获取系统配置
    const sysTemconfig = await this.systemConfigService.findLatestOne();
    const isAutoAddSelf = sysTemconfig.isAutoAddSelf;

    if (!isAutoAddSelf) {
      return;
    }

    const userInfo = await this.usersService.getUserByAccount(account);
    const isAutoAddSelfEvenBoard = sysTemconfig ? sysTemconfig.isAutoAddSelfEvenBoard : true;
    const isAutoAddSelfFirstBoard = sysTemconfig ? sysTemconfig.isAutoAddSelfFirstBoard : true;

    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;
    // 重置成功状态
    isSuccess = true;

    try {
      // 2、清空自选股 TODO 暂未实现
      // console.log(await clearThsSelfStocks(userid, ticket, user));
      // return;
      // 3、插入自选股
      // const funcs = [];
      const app = new AsynTaskIterator();
      this.logger.log(`同步自选: [高标] ${evenBoardData['gaobiao'] && evenBoardData['gaobiao'].length}；`);
      // 3.1 先加入高标；高标看做连板
      isAutoAddSelfEvenBoard && prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user, account);
      // 3.2 再加入连板股
      const maxHeight = evenBoardData.maxHeight;
      for (let i = maxHeight; i >= 1; i--) {
        this.logger.log(`同步自选: [${i}板] ${evenBoardData[i + ''] && evenBoardData[i + ''].length}；`);
        const stocks = evenBoardData[i + ''];
        if (i === 1) {
          // console.log('isAutoAddSelfFirstBoard==', isAutoAddSelfFirstBoard);
          // 加入首板
          isAutoAddSelfFirstBoard && prepareSelfStock(i, stocks, app, userid, ticket, user, account);
        } else {
          // console.log('isAutoAddSelfEvenBoard==', isAutoAddSelfEvenBoard);
          // 加入连板
          isAutoAddSelfEvenBoard && prepareSelfStock(i, stocks, app, userid, ticket, user, account);
        }
      }
      // this.nextRegister(funcs);
      app.run(this);
    } catch (e) {
      isSuccess = false;
      this.logger.log('同步自选 失败了！' + e);
    }
    return {
      code: isSuccess ? 0 : 400,
    };
  }

  /**
   * 批量处理 添加/删除 自选个股（用于去除 竞价不及预期的个股）
   */
  async batchUpdateThsSelfStock(stocks = [], type, account) {
    // 获取系统配置
    const sysTemconfig = await this.systemConfigService.findLatestOne();
    const isBinddingDelEventBoard = sysTemconfig.isBinddingDelEventBoard;
    const isBinddingDelFirstBoard = sysTemconfig.isBinddingDelFirstBoard;

    const app = new AsynTaskIterator();
    const userInfo = await this.usersService.getUserByAccount(account);
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;

    // 重置成功状态
    isSuccess = true;
    try {
      stocks.forEach(stock => {
        app.add(async (ctx, next) => {
          // 判断连板还是 首板（反包板首板算连板）
          let result = {};
          // 保留非首板 evenDays 有值则是非首板 2024-01-07 19:47:33 by zyx）
          if (!stock.evenDays) {
            // 删除连板
            isBinddingDelEventBoard &&
              (result = await modifyThsSelfStocksRequest(stock.code, userid, ticket, user, type));
          } else {
            // 首板
            isBinddingDelFirstBoard &&
              (result = await modifyThsSelfStocksRequest(stock.code, userid, ticket, user, type));
          }

          // TODO 删除前，先获取自选个股，仅删除存在的个股 2024-03-07 11:57:18
          // console.log(stock.name, result);
          isSuccess = dealResultIsLogin(result, ctx, account);
          isSuccess && next();
        });
      });

      app.run(this);
    } catch (e) {
      isSuccess = false;
      this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
    }
    return {
      code: isSuccess ? 0 : 400,
    };
  }

  /**
   *  更新单个自选股（用于手动操作新增 或 删除 自选）
   * @param code
   * @returns
   */
  async updateThsSelfStock(code, type, account) {
    const userInfo = await this.usersService.getUserByAccount(account);
    this.logger.log('[updateThsSelfPlate] 加入自选个股' + code);
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;
    let msg = '';

    try {
      // const result = await modifyThsSelfStocksRequest(code, userid, ticket, user, type);
      const result = await modifyThsSelfRequest(code, userid, ticket, user, type);
      // this.logger.log(result);
      // 同花顺自选接口失败，替换为爱问财接口 2024-06-28 00:20:29
      // msg = dealStockResult(result, this.usersService, account);
      msg = dealPlateResult(result, type, this.usersService, account);
    } catch (e) {
      msg = e;
      this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
    }
    return {
      code: msg ? 400 : 0,
      data: msg,
    };
  }

  /**
   *  更新单个自选板块（用于手动操作新增板块）
   * @param code
   * @returns
   */
  async updateThsSelfPlate(code, type, account) {
    const userInfo = await this.usersService.getUserByAccount(account);
    this.logger.log('[updateThsSelfPlate] 加入自选板块' + code);
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;
    let msg = '';

    try {
      const result = await modifyThsSelfRequest(code, userid, ticket, user, type, true);
      // this.logger.log(result);
      msg = dealPlateResult(result, type, this.usersService, account);
    } catch (e) {
      msg = e;
      this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
    }
    return {
      code: msg ? 400 : 0,
      data: msg,
    };
  }

  /**
   * 获取同花顺新闻
   * @returns {Promise<any>}
   */
  async fetchNewsTask() {
    const result = await fetchNewsRequest(this.latestTime);
    const list = result?.data?.list;
    this.logger.log('[fetchNewsTask] 获取新闻数据: ' + this.latestTime + '，条数：' + list?.length);
    const oldTime = this.latestTime;
    // this.logger.log('[fetchNewsTask] 获取新闻数据 list', list);
    // 取出重要消息进行推送
    list &&
      list.forEach((news, i) => {
        if (i === 0) {
          this.latestTime = news.ctime;
        }
        // color 为 '2'
        if (news.color === '2') {
          try {
            // 推送消息
            this.qyWechatNotice.noticeNews(news.title, news.digest, news.url, news);
          } catch (e) {
            this.logger.log('[fetchNewsTask] 推送消息失败：' + e);
            // 推送失败，还原查询时间
            this.latestTime = oldTime;
          }
        }
      });
  }
}
