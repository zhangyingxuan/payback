export declare function getBiddingData(todayDateStr: any, yesterdayDateStr: any): Promise<{
    dailyLimitYesterdayBidding: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
    newStocks: import("../dto/new-stock.dto").NewStockDto[];
    chooseStock1Expected: import("../dto/strong-stock.dto").StrongStockDto[];
}>;
