import { CreatePayBackDto } from '../dto/create-pay-back.dto';
export declare function getShortTermData(todayDateStr: any, lastTradingDayData: any): Promise<CreatePayBackDto>;
export declare function getShortTermDataByDate(todayDateStr: any, lastTradingDayData: any): Promise<CreatePayBackDto>;
export declare function mergeExtra2ShortTermData(shortTermData: Array<any>, specialStocks: Array<any>): any[];
