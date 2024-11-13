export declare class NewsService {
    latestTime: string;
    tempLatestTime: string;
    private readonly logger;
    fetchNews(latestTime: any, signal: any): Promise<any>;
    importantNewsFilter(list: any, latestTime: any): {
        newsList: any[];
        latestTime: any;
    };
    fetchNewsTask(signal: any): Promise<any[]>;
    fetchLatestNews(latestTime: any): Promise<{
        newsList: any[];
        latestTime: any;
    }>;
    reductionLatestTime(): void;
}
