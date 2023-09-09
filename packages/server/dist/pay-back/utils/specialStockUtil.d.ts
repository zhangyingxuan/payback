export declare function getBiddingData(todayDateStr: any, yesterdayDateStr: any): Promise<{
    dailyLimitYesterdayBiddingDtos: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
    newStocksDtos: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
    chooseStock1to2Dtos: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
}>;
