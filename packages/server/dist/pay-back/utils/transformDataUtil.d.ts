import { DailyLimitYesterdayBiddingDto } from '../dto/daily-limit-yesterday-bidding.dto';
export declare function transformStockData(stockList: any): any;
export declare function transformPlateData(plateList: any): any;
export declare function transformBidData(dailyLimitData: any, todayDateStr: any, yesterdayDate: any, isSaveMore?: boolean): Array<DailyLimitYesterdayBiddingDto>;
export declare function transformShortTermSourceData(dailyLimitData: any, downLimitData: any, hugeFallData: any, todayDateStr: any): {
    board1: number;
    evenBoardData: {
        maxHeight: number;
        gaobiao: any[];
        yizi: number;
    };
    downLimitDataArr: any[];
    hugeFallDataArr: any[];
    downLimitQuantity: number;
    dailyLimitReturnSealQuantity: number;
};
