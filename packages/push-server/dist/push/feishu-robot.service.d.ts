import { ConfigService } from '@nestjs/config';
interface FeishuNews {
    tag?: string;
    ctime?: string | number;
    field?: Array<{
        name: string;
        stockCode: string;
    }>;
    stock?: Array<{
        name: string;
        stockCode: string;
    }>;
}
export declare class FeishuRobotService {
    private readonly config;
    private readonly logger;
    private readonly webhookUrls;
    private readonly signingSecrets;
    constructor(config: ConfigService);
    isEnabled(): boolean;
    notice(serviceName: string, msgContent: string): Promise<PromiseSettledResult<any>[]>;
    noticeNews(newsTitle: string, msgContent: string, newsUrl: string, news?: FeishuNews): Promise<PromiseSettledResult<any>[]>;
    private prepareStocks;
    private getNewsTime;
    private pushCard;
    private send;
    private createSignature;
    private parseList;
}
export {};
