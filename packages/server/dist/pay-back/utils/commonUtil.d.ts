export declare function toFixed(num: any, floatLen?: number): number;
export declare function fundsToFixed(num: any, floatLen?: number): number;
export declare function getIwencaiData(responseJson: any): any[];
export declare function getLastTradingDay(nowStr: string): string;
export declare function isHoliday(date: string): void;
declare const _default: {
    getIwencaiData: typeof getIwencaiData;
    toFixed: typeof toFixed;
    fundsToFixed: typeof fundsToFixed;
    getLastTradingDay: typeof getLastTradingDay;
};
export default _default;
