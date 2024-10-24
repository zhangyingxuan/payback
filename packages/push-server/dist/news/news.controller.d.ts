import { NewsService } from './news.service';
import { PushService } from '../push/push.service';
export declare class NewsController {
    private readonly newsService;
    private readonly pushService;
    constructor(newsService: NewsService, pushService: PushService);
    private readonly logger;
    fetchNewsTask(): Promise<void>;
}
