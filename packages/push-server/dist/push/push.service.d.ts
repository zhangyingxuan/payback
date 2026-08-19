export declare class PushService {
    private readonly logger;
    private readonly robotList;
    notice(serviceName: any, msgContent?: string): Promise<[PromiseSettledResult<PromiseSettledResult<any>[]>, PromiseSettledResult<PromiseSettledResult<any>[]>]>;
    prepareTagContent(tags: any, baseUrl: any): string;
    prepareMsgWord(newsTitle: any): any;
    noticeNews(newsTitle: any, msgContent: string, newsUrl: any, news?: any): Promise<[PromiseSettledResult<PromiseSettledResult<any>[]>, PromiseSettledResult<PromiseSettledResult<any>[]>]>;
    pushMsg2Robot(body: any): Promise<PromiseSettledResult<any>[]>;
    private logRejectedChannels;
    private pushFeishuMarkdown;
    private sendFeishu;
    private createFeishuSignature;
    qyapi(robotKey: any, body: any): Promise<any>;
}
