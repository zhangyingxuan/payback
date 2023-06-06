// import { Injectable, Logger } from '@nestjs/common';
// import { Repository } from 'typeorm';
// import { hotList } from '../entities/hotList.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import playWrightUtil from '../utils/playWrightUtil'
// import { CreateHotListDto } from '../dto/create-hot-list.dto';
// import * as dayjs from 'dayjs';
// import { Cron } from '@nestjs/schedule';
// import axios from 'axios';
// // import { HttpService } from '@nestjs/axios';

// const apiUrls = {
//   // 概念板块
//   conceptPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate',
//   // 行业板块
//   industryPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry',
// }

// @Injectable()
// export class HotListService {
//   constructor(
//     @InjectRepository(hotList) private readonly hotListRp: Repository<hotList>,
//     // private readonly http: HttpService,
//   ) { }

//   private readonly logger = new Logger(HotListService.name);


//   // * * * * * *：每一秒
//   // 45 * * * * *：每分钟，在45秒
//   // * 10 * * * *：每小时一次，十分钟开始
//   // 0 */30 9-17 * * *：上午九时至下午五时，每三十分钟一次
//   // 0 30 11 * * 1-5：星期一至星期五上午11:30
//   // @Cron('0 30 * 7-24 * 1-5')
//   async crawlHotListData() {
//     this.logger.debug('crawlHotListData is Begining!');
//     // 如果存在数据，则返回已有该数据
//     const todayDateStr = new Date().toLocaleDateString();
//     const todayDataFromDB = await this.hotListRp
//       .createQueryBuilder('hot_list')
//       .where("hot_list.createTime like :createTime", { createTime: dayjs(todayDateStr).format('YYYY-MM-DD') + '%' })
//       .getOne();

//     if (todayDataFromDB) {
//       this.logger.debug('crawlHotListData is isExist!');
//       return {
//         code: 'isExist',
//         msg: todayDateStr + ' 数据已存在！',
//       }
//     }
//     let hotListData: CreateHotListDto;
//     try {
//       hotListData = await playWrightUtil.getHotListData(dayjs(todayDateStr).format('YYYYMMDD'));
//       // this.logger.log(hotListData);
//       // await this.hotListRp.save(hotListData);
//       this.logger.debug('crawlHotListData is success!');
//     } catch (e) {
//       this.logger.error('出错啦！！！', e)
//     }
//     // 深圳 还是 上海涨停的多 SZ. SH
//     return hotListData;
//   }

//   async getTodos() {
//     console.log('====getTodos======');
//     const instance = axios.create({
//       // baseURL: 'http://localhost:3000',
//       withCredentials: true,
//       headers: {
//         Accept: "application/json, text/plain, */*",
//         "Content-Type": "application/json",
//         "X-Requested-With": "XMLHttpRequest",
//       },
//       proxy: {
//         protocol: 'https',
//         host: 'https://dq.10jqka.com.cn',
//         port: 443,
//         // auth: {
//         //   username: 'mikeymike',
//         //   password: 'rapunz3l'
//         // }
//       },
//     })
//     // const response = await instance.get('http://localhost:3000/blowsysun/pay-back/list');
//     // const response = await instance.get(apiUrls.conceptPlate, { params: { type: 'concept' } });
//     const response = await instance.get(apiUrls.industryPlate, { params: { type: 'concept' } });
//     console.log(response);
//     // const response = await http.request<any>("get", `https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry`);
//     // const response = await axios.get(apiUrls.industryPlate);
//     // const response = await axios.get('http://www.blowsysun.top:3000/blowsysun');
//     // const response = await axios.get('http://localhost:3000/blowsysun/pay-back/list', { params: { limit: '10' } });

//     // return response;
//     // return this.http.get('https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate', {
//     //   timeout: 10000,
//     //   headers: {
//     //     Accept: "application/json, text/plain, */*",
//     //     "Content-Type": "application/json",
//     //     "X-Requested-With": "XMLHttpRequest"
//     //   },
//     //   params: { type: 'concept' }
//     // }).pipe(
//     //   // return this.http.get('http://www.blowsysun.top:3000/blowsysun').pipe(
//     //   // return this.http.get(apiUrls.industryPlate).pipe(
//     //   map((res) => {
//     //     console.log(res.data)
//     //     return res.data
//     //   })
//     // );
//     // console.log(response.data)
//   }


//   async findAll() {
//     return await this.hotListRp.find();
//   }
//   async findByLimit(len: number = 20) {
//     return await this.hotListRp
//       .createQueryBuilder('hot_list_data')
//       .offset(0)
//       .limit(len)
//       .orderBy('createTime', 'DESC')
//       .getMany();
//   }
// }
