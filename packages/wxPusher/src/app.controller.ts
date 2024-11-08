import { Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './decorator/public.decorator';
import { Wechaty } from 'wechaty';
import { getRobotInstance } from './utils/ding-dong-bot';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, @Inject('BotInstance') private readonly botInstance: Wechaty) { }

  @Public()
  @Get('/pushMessage')
  // async pushMessage(@Body() body: CrawlTodayDataDto) {
  async pushMessage(@Query() query) {
    const msg = query.msg;
    const room = await this.botInstance.Contact.find({ name: '太阳' });
    const contactList = await this.botInstance.Contact.findAll();
    if (room) {
      await room.say(msg || '抓到你了');
      return {
        code: 0,
      };
    } else {
      console.log('登录错误');
      console.log(contactList.length);

      const bot = getRobotInstance();
      // 获取 新的机器人，并设置为全局变量
      return {
        code: 500,
        msg: '登录错误',
      };
    }
  }
}
