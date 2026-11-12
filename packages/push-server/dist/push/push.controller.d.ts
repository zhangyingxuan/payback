import { PushService } from './push.service';
import { ReviewChartsPushService } from './review-charts.service';
export declare class PushController {
    private readonly pushService;
    private readonly reviewCharts;
    constructor(pushService: PushService, reviewCharts: ReviewChartsPushService);
    pushReviewCharts(payload: any): Promise<{
        ok: boolean;
        failures: string[];
    }>;
    noticeNews(newsTitle: any, msgContent: string, newsUrl: any, news?: any): any;
    notice(serviceName: any, msgContent: any): any;
    pushMorningMessage(payload: any): any;
}
