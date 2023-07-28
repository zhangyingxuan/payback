import { Injectable, Logger } from '@nestjs/common';
import { modifyThsSelfStocks, clearThsSelfStocks } from '../core/fetchUtil';
import { UsersService } from '../../users/users.service';

let isSuccess = true;

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml#2023-07-20
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
  if (currentLevel != 1) return true;
  // 连板全部加入
  return stock.type == 0 && stock.price <= 30 && (stock.circulationValue >= 20 && stock.circulationValue <= 120);
}

function prepareSelfStock(i, stocks, app, userid, ticket, user) {
  if (stocks) {
    for (let j = 0; j < stocks.length; j++) {
      // 仅插入 10cm的个股
      isAddSelf(stocks[j], i) && app.add(async (ctx, next) => {
        const result = await modifyThsSelfStocks(stocks[j].code, userid, ticket, user);
        console.log(stocks[j].name, result);
        if (result.errorMsg === '当前用户未登录') {
          this.logger.log('当前用户未登录');
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

class Iterator {
  middlewares: Array<Function>;

  constructor() {
    this.middlewares = [];
  }


  add(fn) {
    this.middlewares.push(fn); //存入任务
    return this;
  }
  async run(ctx) {
    function createNext(middleware, oldNext) {
      return async () => {
        await middleware(ctx, oldNext);
      }
    }
    let len = this.middlewares.length;
    let next = async () => {
      return Promise.resolve();
    };
    for (let i = len - 1; i >= 0; i--) {
      let currentMiddleware = this.middlewares[i];
      next = createNext(currentMiddleware, next);
    }
    await next();
  }
}

@Injectable()
export class ThsService {
  constructor(
    private readonly usersService: UsersService,
  ) { }

  private readonly logger = new Logger(ThsService.name);

  nextRegister(args: Array<Function>) {
    var count = 0;
    var comm = {};
    function nextTime() {
      count++;
      if (count < args.length) {
        if (args[count] && Object.prototype.toString.call(args[count]) == '[object AsyncFunction]') {
          args[count](comm, nextTime);
        }
      }
    }
    if (args[count] && Object.prototype.toString.call(args[count]) == '[object AsyncFunction]') {
      args[count](comm, nextTime);
    }
  }

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
      let app = new Iterator();
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

