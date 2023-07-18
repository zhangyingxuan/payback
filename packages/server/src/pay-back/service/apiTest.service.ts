import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { InjectRepository } from '@nestjs/typeorm';
import fetch from 'node-fetch';
import { createV } from '../core/hexin-v.js';
const zlib = require('node:zlib');

const apiUrls = {
  // 概念板块
  conceptPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate',
  // 行业板块
  industryPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry',
  iwencaiRoboot: 'https://www.iwencai.com/customized/chart/get-robot-data',
}

@Injectable()
export class ApiTestService {
  constructor(
    @InjectRepository(hotList) private readonly hotListRp: Repository<hotList>,
    // private readonly http: HttpService,
  ) { }

  private readonly logger = new Logger(ApiTestService.name);

  async fetchExternalData() {

    const body = {
      "source": "Ths_iwencai_Xuangu",
      "version": "2.0",
      // "query_area": "", "block_list": "",
      // "add_info": {
      //   "urp": { "scene": 1, "company": 1, "business": 1 },
      //   "contentType": "json", "searchInfo": true
      // },
      "question": "连续涨停天数>=1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；",
      "perpage": 100,
      "page": 1,
      // "secondary_intent": "stock",
      // "log_info": { "input_type": "typewrite" },
      // "rsh": "Ths_iwencai_Xuangu_cj7r4l37naa3g54vm4j6pk04xq86kyvq"
    }

    const result = await fetch("https://www.iwencai.com/customized/chart/get-robot-data", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/json",
        "hexin-v": createV(),
        "pragma": "no-cache"
      },
      "body": JSON.stringify(body),
      "method": "POST",
    });
    console.log(await result.json());
    // console.log(result?.data?.answer);
  }

  async fetchHotList() {
    fetch("https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112309386087809528996_1689650979956&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=1689650979958")
      // fetch("https://push2.eastmoney.com/api/qt/ulist.np/get?cb=jQuery112304396074520394937_1688383194361&fltt=2&secids=1.000001%2C0.399001&fields=f1%2Cf2%2Cf3%2Cf4%2Cf6%2Cf12%2Cf13%2Cf104%2Cf105%2Cf106&ut=b2884a393a59ad64002292a3e90d46a5&_=1688383194362")
      // fetch("https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/stock?stock_type=a&type=hour&list_type=normal")
      .then(async (response) => await response.text()).then(data => console.log(data)).catch(e => console.error(e));
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
