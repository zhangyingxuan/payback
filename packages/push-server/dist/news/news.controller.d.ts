import { NewsService } from './news.service';
import { PushService } from '../push/push.service';
export declare class NewsController {
    private readonly newsService;
    private readonly pushService;
    constructor(newsService: NewsService, pushService: PushService);
    private readonly logger;
    private controller;
    fetchNewsTask(): Promise<void>;
    fetchLatestNews(payload: any): Promise<{
        code: number;
        data: any;
    }>;
}
