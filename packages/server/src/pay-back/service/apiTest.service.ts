import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { InjectRepository } from '@nestjs/typeorm';
import fetch from 'node-fetch';
import { createV } from '../core/hexin-v';
const zlib = require('node:zlib');
import { stringify } from 'qs';
import { getCurrentCycle, params } from 'pay-back-core';
import { fetchIwencaiApi } from '../core/fetchUtil';
import { transformStrongStockData } from '../utils/transformDataUtil';

const apiUrls = {
  // 概念板块
  conceptPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate',
  // 行业板块
  industryPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry',
  iwencaiRoboot: 'https://www.iwencai.com/customized/chart/get-robot-data',
}

const thsUrl = {
  'getSelfStockWithMarket': 'https://t.10jqka.com.cn/newcircle/group/getSelfStockWithMarket',
  // 获取 所有自选股，包括 自定义分组
  'getAllSelfStock': 'https://www.iwencai.com/unifiedwap/self-stock/plate/list',
  'get': 'http://pop.10jqka.com.cn/getselfstockinfo.php',
  'modify': 'http://stock.10jqka.com.cn/self.php',
  'modifySelfStock': 'https://t.10jqka.com.cn/newcircle/group/modifySelfStock/'
}

@Injectable()
export class ApiTestService {
  constructor(
    @InjectRepository(hotList) private readonly hotListRp: Repository<hotList>,
    // private readonly http: HttpService,
  ) { }

  private readonly logger = new Logger(ApiTestService.name);

  async fetchExternalData() {
    const v = createV();
    console.log(v);
    const result = await fetch("http://www.iwencai.com/customized/chart/get-robot-data", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "hexin-v": v,
        "pragma": "no-cache"
      },
      "referrer": "http://www.iwencai.com/unifiedwap/result?w=%E6%A6%82%E5%BF%B5%E6%9D%BF%E5%9D%97%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%EF%BC%9B%E6%B6%A8%E8%B7%8C%E5%B9%85%E6%AD%A3%E5%BA%8F&querytype=zhishu&addSign=1691417873467",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{\"source\":\"Ths_iwencai_Xuangu\",\"version\":\"2.0\",\"query_area\":\"\",\"block_list\":\"\",\"add_info\":\"{\\\"urp\\\":{\\\"scene\\\":1,\\\"company\\\":1,\\\"business\\\":1},\\\"contentType\\\":\\\"json\\\",\\\"searchInfo\\\":true}\",\"question\":\"概念板块主力资金；涨跌幅正序\",\"perpage\":\"100\",\"page\":1,\"secondary_intent\":\"zhishu\",\"log_info\":\"{\\\"input_type\\\":\\\"typewrite\\\"}\",\"rsh\":\"Ths_iwencai_Xuangu_cj7r4l37naa3g54vm4j6pk04xq86kyvq\"}",
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    });

    console.log(await result.json());
  }

  async fetchHotList() {
    fetch("https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112309386087809528996_1689650979956&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=1689650979958")
      // fetch("https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=1688383194362")
      // fetch("https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/stock?stock_type=a&type=hour&list_type=normal")
      .then(async (response) => await response.text()).then(data => console.log(data)).catch(e => console.error(e));
  }

  async getThsSelfStocks() {
    fetch(thsUrl.get,
      {
        "headers": {
          "accept": "application/json, text/plain, */*",
          "accept-language": "zh-CN,zh;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/json",
          "pragma": "no-cache",
          'Cookie': 'MDptb182MzE0MTAzMTc6Ok5vbmU6NTAwOjY0MTQxMDMxNzo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDoyNzo6OjYzMTQxMDMxNzoxNjg5NzUwNDI1Ojo6MTY1MDk4ODUwMDo2MDQ4MDA6MDoxOTI0MDRlYjVjZjIwMTZiNDQxMjkxZGJjZTIwMWEzZDM6ZGVmYXVsdF80OjE',
        }
      })
      .then(data => console.log(data)).catch(e => console.error(e));
    // .then(async (response) => await response.text()).then(data => console.log(data)).catch(e => console.error(e));
  }

  async modifyThsSelfStocks() {
    // # 更改同花顺自选股列表
    // # method: add 添加, del 删除, exc 排序
    // # pos: 排序用的序号, 从1开始
    const code = '000553';
    const pos = '1';
    const payload = {
      'add': { 'stockcode': code, 'op': 'add' },
      'del': { 'stockcode': code, 'op': 'del' },
      'exc': { 'stockcode': code, 'op': 'exc', 'pos': pos, 'callback': 'callbacknew' }
    }
    // https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=000551_33
    // https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?op=add&stockcode=000980
    // console.log("http://stock.10jqka.com.cn/self.php?" + stringify(payload.add));
    console.log("https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?" + stringify(payload.add));
    const userid = '631410317';
    const ticket = 'e64f54692d843e69da6dbb579e220e30';
    const user = 'MDptb182MzE0MTAzMTc6Ok5vbmU6NTAwOjY0MTQxMDMxNzo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDoyNzo6OjYzMTQxMDMxNzoxNjg5ODIzNzE4Ojo6MTY1MDk4ODUwMDo4NjQwMDowOjE2Y2M0ZWIzOGNhZjUzNjU5MjU2MTNiYzdhM2JlNTAzOTpkZWZhdWx0XzQ6MQ%3D%3D';
    fetch("https://t.10jqka.com.cn/newcircle/group/modifySelfStock/?" + stringify(payload.add), {
      "headers": {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        "Cookie": `userid=${userid}; u_name=mo_${userid}; escapename=mo_${userid}; user=${user}; ticket=${ticket};`,
      },
      "referrer": "https://t.10jqka.com.cn/newcircle/user/userPersonal/?from=circle",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    })
      .then(async (response) => await response.text()).then(data => console.log(data)).catch(e => console.error(e));
  }
  async datacenterWeb() {
    const dateTime = new Date().getTime();
    const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112304542900785353563_${dateTime}&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=${dateTime}`;
    console.log(url);
    fetch(url, {
      "headers": {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"115\", \"Chromium\";v=\"115\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"macOS\"",
        "sec-fetch-dest": "script",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "same-site"
      },
      "referrer": "https://data.eastmoney.com/hsgt/index.html",
      "referrerPolicy": "unsafe-url",
      "body": null,
      "method": "GET",
      "mode": "cors",
      "credentials": "include"
    })
      .then(async (response) => await response.text()).then(data => console.log(data)).catch(e => console.error(e));
  }

  async otherTest() {
    // const cycle = getCurrentCycle({
    //   downLimitQuantity: 3,
    //   dailyLimitQuantity: 32,
    //   dailyLimitOpenQuantity: 10,
    //   sealingRate: 76,
    //   dailyLimitReturnSealQuantity: 14,
    //   marketHeight: 6,
    //   evenBoardAmount: 11,
    //   hugeFallData: '[]',
    //   createTime: '2023 - 08 - 21T10: 37: 54.433Z'
    // });
    // console.log(cycle);


    // 竞价看多数据 首板预期
    // 昨日未涨停；昨日换手率；10个交易日内有涨停；集中度70<=11；
    // const chooseStock1ExpectedRs: any = await fetchIwencaiApi('竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；集中度70<=11；昨日收盘获利>=50%；同花顺二级行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST', 100, false);
    // const chooseStock1ExpectedRs: any = await fetchIwencaiApi(params.chooseStock1Expected, 100, false);
    const chooseStock1ExpectedRs: any = await fetchIwencaiApi('竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；昨日未涨停；集中度70<=11；昨日收盘获利>=50%；行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST', 100, false);
    // const chooseStock1Expected = transformStrongStockData(chooseStock1ExpectedRs, todayDateStr, yesterdayDateStr);
    console.log(chooseStock1ExpectedRs);
  }

  async findAll() {
    return await this.hotListRp.find();
  }
  async findByLimit(len: number = 20) {
    return await this.hotListRp
      .createQueryBuilder('hot_list_data')
      .offset(0)
      .limit(len)
      .orderBy('createTime', 'DESC')
      .getMany();
  }
}
