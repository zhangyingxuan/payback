import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { hotList } from '../entities/hotList.entity';
import { InjectRepository } from '@nestjs/typeorm';
// const fetch = require('node-fetch');
import fetch from 'node-fetch';

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
    fetch("https://www.iwencai.com/customized/chart/get-robot-data", {
      "headers": {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "hexin-v": "Axq2opcfKpP9_6Y_lQ66qG3gbcs5S54nEM8SySSTxq14l7R1DNvuNeBfYtz3",
        // "accept-language": "zh-CN,zh;q=0.9",
        // "cache-control": "no-cache",
        // "pragma": "no-cache",
        // "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
        // "sec-ch-ua-mobile": "?0",
        // "sec-ch-ua-platform": "\"macOS\"",
        // "sec-fetch-dest": "empty",
        // "sec-fetch-mode": "cors",
        // "sec-fetch-site": "same-origin"
      },
      // "referrer": "https://www.iwencai.com/unifiedwap/result?w=%E8%A1%8C%E4%B8%9A%E6%9D%BF%E5%9D%97%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%EF%BC%9B%E6%B6%A8%E8%B7%8C%E5%B9%85%E5%80%92%E5%BA%8F",
      // "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "{\"source\":\"Ths_iwencai_Xuangu\",\"version\":\"2.0\",\"query_area\":\"\",\"block_list\":\"\",\"add_info\":\"{\\\"urp\\\":{\\\"scene\\\":1,\\\"company\\\":1,\\\"business\\\":1},\\\"contentType\\\":\\\"json\\\",\\\"searchInfo\\\":true}\",\"question\":\"行业板块主力资金；涨跌幅倒序\",\"perpage\":\"50\",\"page\":1,\"secondary_intent\":\"\",\"log_info\":\"{\\\"input_type\\\":\\\"click\\\"}\",\"rsh\":\"Ths_iwencai_Xuangu_cj7r4l37naa3g54vm4j6pk04xq86kyvq\"}",
      "method": "POST",
    }).then(response => response.json()).then(data => console.log(JSON.stringify(data?.data?.answer))).catch(e => console.error(e));
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
