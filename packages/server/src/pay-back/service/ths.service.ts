import { Injectable, Logger } from '@nestjs/common';
import { modifyThsSelfStocksRequest, clearThsSelfStocks } from '../core/fetchUtil';
import { AsynTaskIterator } from 'pay-back-core';
import { UsersService } from '../../users/users.service';
import { dailyLimitOptionalStrategy } from 'pay-back-core';

let isSuccess = true;

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml
// 交易提醒 http://stock.10jqka.com.cn/jyts_list/
// 四大证券 文章精华 http://stock.10jqka.com.cn/bktt_list/
function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
};

function prepareSelfStock(i, stocks, app, userid, ticket, user) {
  if (stocks) {
    for (let j = 0; j < stocks.length; j++) {
      // 仅插入 10cm的个股
      dailyLimitOptionalStrategy(stocks[j], i) && app.add(async (ctx, next) => {
        const result = await modifyThsSelfStocksRequest(stocks[j].code, userid, ticket, user);
        console.log(stocks[j].name, result);
        if (result.errorMsg === '当前用户未登录') {
          // https://www.10jqka.com.cn/ 重新登录地址
          ctx.logger.log('当前用户未登录：https://www.10jqka.com.cn/');
          //  当前用户未登录，则停止之后的异步调用请求
          isSuccess = false;
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
  constructor(
    private readonly usersService: UsersService,
  ) { }

  private readonly logger = new Logger(ThsService.name);

  async modifyThsSelfStocks(evenBoardData) {
    const userInfo = await this.usersService.getUserByAccount('admin');
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
      let app = new AsynTaskIterator();
      this.logger.log(`同步自选: [高标] ${evenBoardData['gaobiao'] && evenBoardData['gaobiao'].length}；`);
      // 3.1 先加入高标
      prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user);
      // 3.2 再加入连板股
      const maxHeight = evenBoardData.maxHeight;
      for (let i = maxHeight; i >= 1; i--) {
        this.logger.log(`同步自选: [${i}板] ${evenBoardData[i + ''].length}；`);
        const stocks = evenBoardData[i + ''];
        prepareSelfStock(i, stocks, app, userid, ticket, user);
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
}

