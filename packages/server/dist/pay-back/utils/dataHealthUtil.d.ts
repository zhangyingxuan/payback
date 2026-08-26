export type DataHealthStatus = 'fresh' | 'stale' | 'missing' | 'empty';
export declare function getExpectedTradeDate(latestDate?: any, now?: Date): string;
export declare function createDataHealth(name: string, record: any, expectedDate: string, count?: number): {
    name: string;
    status: DataHealthStatus;
    tradeDate: string;
    count: number;
    updatedTime?: undefined;
} | {
    name: string;
    status: "empty" | "fresh" | "stale";
    tradeDate: string;
    updatedTime: any;
    count: number;
};
export declare function jsonLength(value?: string): number;
