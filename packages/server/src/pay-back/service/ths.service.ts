import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { modifyThsSelfStocks } from '../core/fetchUtil';

// 投资日历 http://stock.10jqka.com.cn/fincalendar.shtml#2023-07-20
// 交易提醒 http://stock.10jqka.com.cn/jyts_list/
// 四大证券 新闻精华 http://stock.10jqka.com.cn/bktt_list/
const during = 1000;

@Injectable()
export class ThsService {
  constructor(
  ) { }

  private readonly logger = new Logger(ThsService.name);

  // private sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

  async modifyThsSelfStocks(evenBoardData, dailyLimitQuantity) {
    let isSuccess = true;
    this.logger.log('同步自选 开始');
    try {
      let times = 3;
      // 避免添加自选失败，重复添加3 次，直到添加完
      while (times--) {
        (function (i, _this) {
          setTimeout(async () => {
            _this.dealNetRequest(evenBoardData)
          }, i * (dailyLimitQuantity + 1) * during);
        })(times, this)
      }
      this.logger.log('同步自选 成功');
    } catch (e) {
      isSuccess = false;
      this.logger.log('同步自选 失败了！' + e);
    }
    return {
      code: isSuccess ? 200 : 400,
      data: evenBoardData,
    };
  }

  dealNetRequest(evenBoardData) {
    // 如果有数据，则同步
    // 尾盘结束后，同步数据到自选
    const maxHeight = evenBoardData.maxHeight;
    for (let i = 1; i <= maxHeight; i++) {
      let stocks = evenBoardData[i + ''];
      if (stocks) {
        for (let j = 0; j < stocks.length; j++) {
          // 每个方法延迟执行
          (function (t, item) {
            setTimeout(async () => {
              const result = await modifyThsSelfStocks(item.code);
              // console.log(item.name);
              // console.log(item.name, result);
            }, t * during);
          })(j, stocks[j]);
        }
      }
    }
  }
}

