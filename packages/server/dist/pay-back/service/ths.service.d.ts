export declare class ThsService {
    constructor();
    private readonly logger;
    modifyThsSelfStocks(evenBoardData: any, dailyLimitQuantity: any): Promise<{
        code: number;
        data: any;
    }>;
    dealNetRequest(evenBoardData: any): void;
}
