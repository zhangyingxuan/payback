import { CreatePayBackDto } from '../dto/create-pay-back.dto';
export declare function getShortTermData(todayDateStr: any): Promise<CreatePayBackDto>;
export declare function getShortTermDataByDate(todayDateStr: any): Promise<CreatePayBackDto>;
export declare function autoRemoveLessThanExpect(): Promise<void>;
export declare function mergeExtra2ShortTermData(shortTermData: Array<any>, specialStocks: Array<any>): any[];
