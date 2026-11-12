export declare const feishuWebhookUrls: string[];
export declare const feishuSigningSecrets: string[];
export declare class PushService {
    private readonly logger;
    readonly robotList: string[];
    notice(serviceName: any, msgContent?: string): Promise<[PromiseSettledResult<PromiseSettledResult<any>[]>, PromiseSettledResult<PromiseSettledResult<any>[]>]>;
    prepareTagContent(tags: any, baseUrl: any): string;
    prepareMsgWord(newsTitle: any): any;
    noticeNews(newsTitle: any, msgContent: string, newsUrl: any, news?: any): Promise<[PromiseSettledResult<PromiseSettledResult<any>[]>, PromiseSettledResult<PromiseSettledResult<any>[]>]>;
    pushMorningMessage(payload: any): Promise<[PromiseSettledResult<any>, PromiseSettledResult<PromiseSettledResult<any>[]>]>;
    pushMsg2Robot(body: any): Promise<PromiseSettledResult<any>[]>;
    private logRejectedChannels;
    private pushFeishuMarkdown;
    sendFeishu(webhookUrl: string, secret: string, card: any): Promise<any>;
    private createFeishuSignature;
    qyapi(robotKey: any, body: any): Promise<any>;
}
