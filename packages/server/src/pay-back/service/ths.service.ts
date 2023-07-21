import { Injectable, Logger } from '@nestjs/common';
import { modifyThsSelfStocks } from '../core/fetchUtil';
import { UsersService } from '../../users/users.service';

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml#2023-07-20
// 交易提醒 http://stock.10jqka.com.cn/jyts_list/
// 四大证券 新闻精华 http://stock.10jqka.com.cn/bktt_list/
function atob(a) {
  return Buffer.from(a, 'base64').toString('binary');
};

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

let isLogin = { value: true, index: 1 };

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
    let isSuccess = true;
    this.logger.log('同步自选');

    const userInfo = await this.usersService.getUserByAccount('admin');
    // 获取用户信息
    const userid = atob(userInfo.userid);
    const ticket = userInfo.ticket;
    const user = userInfo.user;

    try {
      // const funcs = [];
      let app = new Iterator();
      const maxHeight = evenBoardData.maxHeight;
      for (let i = maxHeight; i >= 1; i--) {
        const stocks = evenBoardData[i + ''];

        if (stocks) {
          for (let j = 0; j < stocks.length; j++) {

            app.add(async (ctx, next) => {
              const result = await modifyThsSelfStocks(stocks[j].code, userid, ticket, user);
              console.log(stocks[j].name, result);
              if (result.errorMsg === '当前用户未登录') {
                //  当前用户未登录，则停止之后的异步调用请求
                isSuccess = false;
                return;
              }
              next();
            });
            // funcs.push(async (comm, next) => {
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

