import { StrongStockDto } from '../dto/strong-stock.dto';
import { DailyLimitYesterdayBiddingDto } from '../dto/daily-limit-yesterday-bidding.dto';
import { NewStockDto } from '../dto/new-stock.dto';
export declare function transformStockData(stockList: any): any;
export declare function transformPlateData(plateList: any): any;
export declare function transformBidData(stocks: any, todayDateStr: any, yesterdayDate: any, isSaveMore?: boolean): Array<DailyLimitYesterdayBiddingDto>;
export declare function transformNewStockData(stocks: any, todayDateStr: any): Array<NewStockDto>;
export declare function transformStrongStockData(stocks: any, todayDateStr: any, yesterdayDate: any): Array<StrongStockDto>;
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
