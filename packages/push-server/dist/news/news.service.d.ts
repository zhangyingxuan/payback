export declare class NewsService {
    latestTime: string;
    tempLatestTime: string;
    private readonly logger;
    fetchNews(latestTime: any): Promise<any[]>;
    importantNewsFilter(list: any, latestTime: any): {
        newsList: any[];
        latestTime: any;
    };
    fetchNewsTask(): Promise<any[]>;
    fetchLatestNews(latestTime: any): Promise<{
        newsList: any[];
        latestTime: any;
    }>;
    reductionLatestTime(): void;
}
