import { PushService } from './push.service';
export declare class PushController {
    private readonly pushService;
    constructor(pushService: PushService);
    noticeNews(newsTitle: any, msgContent: string, newsUrl: any, news?: any): any;
    notice(serviceName: any, msgContent: any): any;
}
