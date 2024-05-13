export declare function fetchLastdayDailyLimitBinddingData(todayDateStr: any, yesterdayDateStr: any): Promise<import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[]>;
export declare function fetchSpecialStockBinddingData(todayDateStr: any, yesterdayDateStr: any): Promise<{
    newStocks: import("../dto/new-stock.dto").NewStockDto[];
    chooseStock1Expected: import("../dto/strong-stock.dto").StrongStockDto[];
}>;
