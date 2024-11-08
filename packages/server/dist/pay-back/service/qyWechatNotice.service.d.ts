export declare class QyWechatNotice {
    constructor();
    private readonly NODE_ENV;
    private readonly logger;
    private readonly robotList;
    notice(serviceName: any, msgContent?: string): Promise<void>;
    prepareTagContent(tags: any, baseUrl: any): string;
    prepareMsgWord(newsTitle: any): any;
    noticeNews(newsTitle: any, msgContent: string, newsUrl: any, news?: any): Promise<void>;
    pushMsg2Robot(body: any): void;
    qyapi(robotKey: any, body: any): void;
}
