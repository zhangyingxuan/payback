import { CreatePayBackDto } from '../dto/create-pay-back.dto';
export declare function getShortTermData(todayDateStr: any): Promise<CreatePayBackDto>;
export declare function getShortTermDataByDate(todayDateStr: any): Promise<CreatePayBackDto>;
export declare function autoRemoveLessThanExpect(): Promise<void>;
export declare function getBiddingData(todayDateStr: any, yesterdayDateStr: any): Promise<{
    dailyLimitYesterdayBiddingDtos: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
    newStocksDtos: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
    chooseStock1to2Dtos: import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[];
}>;
