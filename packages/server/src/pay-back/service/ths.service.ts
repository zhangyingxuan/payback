import { Injectable, Logger } from '@nestjs/common';
import { modifyThsSelfStocks, clearThsSelfStocks } from '../core/fetchUtil';
import { FetchRequestIterator } from '../core/fetchRequestIterator';
import { UsersService } from '../../users/users.service';

let isSuccess = true;

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml
// 交易提醒 http://stock.10jqka.com.cn/jyts_list/
// 四大证券 文章精华 http://stock.10jqka.com.cn/bktt_list/
function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
};

/**
 * 是否加入自选
 * 连板全部加入
 * 首板：流通市值大于30亿 且小于120亿，涨停10cm的个股，股价低于30
 */
function isAddSelf(stock, currentLevel) {
  // 创业板、科创板不自选
  if (stock.type != 0) return false;
  // 连板全部加入
  if (currentLevel != 1) return true;
  return stock.price <= 30 && (stock.circulationValue >= 20 && stock.circulationValue <= 120);
}

function prepareSelfStock(i, stocks, app, userid, ticket, user) {
  if (stocks) {
    for (let j = 0; j < stocks.length; j++) {
      // 仅插入 10cm的个股
      isAddSelf(stocks[j], i) && app.add(async (ctx, next) => {
        const result = await modifyThsSelfStocks(stocks[j].code, userid, ticket, user);
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
      //   comm = await modifyThsSelfStocks(stocks[j].code, userid, ticket, user);
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
    this.logger.log('同步自选');

    const userInfo = await this.usersService.getUserByAccount('admin');
    // 1、获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;

    try {
      // 2、清空自选股 TODO 暂未实现
      // console.log(await clearThsSelfStocks(userid, ticket, user));
      // return;
      // 3、插入自选股
      // const funcs = [];
      let app = new FetchRequestIterator();
      // 3.1 先加入高标
      prepareSelfStock(9, evenBoardData['gaobiao'], app, userid, ticket, user);
      // 3.2 再加入连板股
      const maxHeight = evenBoardData.maxHeight;
      for (let i = maxHeight; i >= 1; i--) {
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

