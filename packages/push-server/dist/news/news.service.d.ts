export declare class NewsService {
    latestTime: string;
    tempLatestTime: string;
    private readonly logger;
    fetchNews(): Promise<any[]>;
    reductionLatestTime(): void;
}
