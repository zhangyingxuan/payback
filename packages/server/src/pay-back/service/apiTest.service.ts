import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { InjectRepository } from '@nestjs/typeorm';
import fetch from 'node-fetch';
import { createV } from '../core/hexin-v.js';

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
    fetch("https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/stock?stock_type=a&type=hour&list_type=normal").then(response => response.json()).then(data => console.log(data)).catch(e => console.error(e));
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
