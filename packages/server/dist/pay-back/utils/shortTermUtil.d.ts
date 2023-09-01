import { CreatePayBackDto } from '../dto/create-pay-back.dto';
export declare function getShortTermData(todayDateStr: any): Promise<CreatePayBackDto>;
export declare function getShortTermDataByDate(todayDateStr: any): Promise<CreatePayBackDto>;
export declare function autoRemoveLessThanExpect(): Promise<void>;
export declare function getBiddingData(todayDateStr: any): Promise<import("../dto/daily-limit-yesterday-bidding.dto").DailyLimitYesterdayBiddingDto[]>;
