export declare const ignoreGainianPlates: string[];
export declare const ignoreGainianPlateStr: string;
export declare function toFixed(num: any, floatLen?: number): number;
export declare function fundsToFixed(num: any, floatLen?: number): number;
export declare function getIwencaiData(responseJson: any): any[];
export declare function getStocksDataByIwencai(responseJson: any): {
    data: any[];
    length: number;
    condition: any;
    compId: any;
    uuid: any;
};
export declare function getStocksPagingDataByIwencai(responseJson: any): any[];
export declare function getLastTradingDay(nowStr: string): string;
export declare const getMarketTurnover: (responseMarketTurnoverStr: any) => any;
declare const _default: {
    ignoreGainianPlates: string[];
    ignoreGainianPlateStr: string;
    getIwencaiData: typeof getIwencaiData;
    toFixed: typeof toFixed;
    fundsToFixed: typeof fundsToFixed;
    getLastTradingDay: typeof getLastTradingDay;
    getMarketTurnover: (responseMarketTurnoverStr: any) => any;
};
export default _default;
