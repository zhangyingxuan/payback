import { Injectable, Logger } from '@nestjs/common';
import { modifyThsSelfStocksRequest, modifyThsSelfPlatesRequest } from '../core/fetchUtil';
import { AsynTaskIterator, dailyLimitOptionalStrategy } from 'pay-back-core';
import { UsersService } from '../../users/users.service';
import { SystemConfigService } from './systemConfig.service';

let isSuccess = true;

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml
// 交易提醒 http://stock.10jqka.com.cn/jyts_list/
// 四大证券 文章精华 http://stock.10jqka.com.cn/bktt_list/
function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
}

function prepareSelfStock(i, stocks, app, userid, ticket, user) {
  if (stocks) {
    for (let j = 0; j < stocks.length; j++) {
      // 仅插入 10cm的个股
      dailyLimitOptionalStrategy(stocks[j], i) &&
        app.add(async (ctx, next) => {
          const result = await modifyThsSelfStocksRequest(stocks[j].code, userid, ticket, user);
          console.log(stocks[j].name, result);
          if (result.errorMsg === '当前用户未登录') {
            // https://www.10jqka.com.cn/ 重新登录地址
            ctx.logger.log('当前用户未登录：https://www.10jqka.com.cn/');
            //  当前用户未登录，则停止之后的异步调用请求
            isSuccess = false;
            ctx.usersService.clearUserInfoCache();
            // 清理用户信息缓存
            return;
          }
          next();
        });
      // stock.type === '0' && funcs.push(async (comm, next) => {
      //   comm = await modifyThsSelfStocksRequest(stocks[j].code, userid, ticket, user);
      //   if (comm.errorMsg === '当前用户未登录') {
      //     //  当前用户未登录，则停止之后的异步调用请求
      //     isSuccess = false;
      //     return;
      //   }
      //   next();
      // })
    }
  }
}

@Injectable()
export class ThsService {
  constructor(private readonly usersService: UsersService, private readonly systemConfigService: SystemConfigService) { }

  private readonly logger = new Logger(ThsService.name);

  async autoModifyThsSelfStocks(evenBoardData) {
    // 获取系统配置
    const sysTemconfig = await this.systemConfigService.findLatestOne();
    const isAutoAddSelf = sysTemconfig.isAutoAddSelf;

    if (!isAutoAddSelf) {
      return;
    }

    return await this.modifyThsSelfStocks(evenBoardData, sysTemconfig);
  }

  /**
   * 同步 今日 连板数据
   * @param evenBoardData
   * @returns
   */
  async modifyThsSelfStocks(evenBoardData, sysTemconfig) {
    const userInfo = await this.usersService.getUserByAccount('admin');
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
      // 3.1 先加入高标
      prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user);
      // 3.2 再加入连板股
      const maxHeight = evenBoardData.maxHeight;
      for (let i = maxHeight; i >= 1; i--) {
        this.logger.log(`同步自选: [${i}板] ${evenBoardData[i + ''] && evenBoardData[i + ''].length}；`);
        const stocks = evenBoardData[i + ''];
        if (i === 1) {
          console.log('isAutoAddSelfFirstBoard==', isAutoAddSelfFirstBoard);
          // 加入首板
          isAutoAddSelfFirstBoard && prepareSelfStock(i, stocks, app, userid, ticket, user);
        } else {
          console.log('isAutoAddSelfEvenBoard==', isAutoAddSelfEvenBoard);
          // 加入连板
          isAutoAddSelfEvenBoard && prepareSelfStock(i, stocks, app, userid, ticket, user);
        }
      }
      // this.nextRegister(funcs);
      app.run(this);
    } catch (e) {
      isSuccess = false;
      this.logger.log('同步自选 失败了！' + e);
    }
    return {
      code: isSuccess ? 200 : 400,
      data: evenBoardData,
    };
  }
  /**
   *  更新单个自选股（用于手动操作新增 或 删除 自选）
   * @param code
   * @returns
   */
  async updateThsSelfStock(code, type) {
    const userInfo = await this.usersService.getUserByAccount('admin');
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;
    // 重置成功状态
    isSuccess = true;

    try {
      const result = await modifyThsSelfStocksRequest(code, userid, ticket, user, type);
      // this.logger.log(result);
      if (result.errorCode !== 0) {
        if (result.errorMsg === '当前用户未登录') {
          this.logger.log('[updateThsSelfStock] 当前用户未登录：https://www.10jqka.com.cn/');
          // 清理用户信息缓存
          this.usersService.clearUserInfoCache();
        }
        isSuccess = false;
        return {
          code: 400,
          data: result.errorMsg,
        };
      }
    } catch (e) {
      isSuccess = false;
      this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
    }
    return {
      code: isSuccess ? 200 : 400,
    };
  }
  /**
   * 批量处理 添加/删除 自选个股（用于去除 竞价不及预期的个股）
   */
  async batchUpdateThsSelfStock(stocks = [], type) {
    const app = new AsynTaskIterator();
    const userInfo = await this.usersService.getUserByAccount('admin');
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;

    // 重置成功状态
    isSuccess = true;

    try {
      stocks.forEach(stock => {
        app.add(async (ctx, next) => {
          const result = await modifyThsSelfStocksRequest(stock.code, userid, ticket, user, type);
          console.log(stock.name, result);
          if (result.errorMsg === '当前用户未登录') {
            // https://www.10jqka.com.cn/ 重新登录地址
            ctx.logger.log('当前用户未登录：https://www.10jqka.com.cn/');
            //  当前用户未登录，则停止之后的异步调用请求
            isSuccess = false;
            ctx.usersService.clearUserInfoCache();
            // 清理用户信息缓存
            return;
          }
          next();
        });
      });

      app.run(this);
    } catch (e) {
      isSuccess = false;
      this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
    }
    return {
      code: isSuccess ? 200 : 400,
    };
  }

  /**
   *  更新单个自选板块（用于手动操作新增板块）
   * @param code
   * @returns
   */
  async updateThsSelfPlate(code, type) {
    const userInfo = await this.usersService.getUserByAccount('admin');
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;
    // 重置成功状态
    isSuccess = true;

    try {
      const result = await modifyThsSelfPlatesRequest(code, userid, ticket, user, type);
      // this.logger.log(result);
      if (result.errorCode !== 0) {
        if (result.errorMsg === '当前用户未登录') {
          this.logger.log('[updateThsSelfStock] 当前用户未登录：https://www.10jqka.com.cn/');
          // 清理用户信息缓存
          this.usersService.clearUserInfoCache();
        }
        isSuccess = false;
        return {
          code: 400,
          data: result.errorMsg,
        };
      }
    } catch (e) {
      isSuccess = false;
      this.logger.log('updateThsSelfStock[' + type + '] 失败了！' + e);
    }
    return {
      code: isSuccess ? 200 : 400,
    };
  }
}
