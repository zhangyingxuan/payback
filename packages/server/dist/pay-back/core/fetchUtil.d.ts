export declare function fetchIwencaiApi(question: any, pageSize?: number): Promise<any[]>;
interface IwencaiStockResult {
    data: any;
    length: number;
    condition: Array<any>;
}
export declare function fetchStocksByIwencai(question: any, pageSize?: number): Promise<IwencaiStockResult>;
export declare function fetchIwencai(question: any, pageSize?: number, isPlate?: boolean): Promise<any>;
export declare function getDataListByIwencai(question: any, pageSize: number, pageNum: number, condition: any): Promise<any>;
export declare function fetchMarketData(): Promise<any>;
export declare function clearThsSelfStocks(user: any): Promise<any>;
export declare function fetchMarketPointFromEastmoney(): Promise<any>;
export declare function fetchMarketPoint(apiUrl: any, key: any): Promise<number>;
export declare function fetchNorhFunds(): Promise<any>;
export declare enum ThsOprate {
    add = "add",
    del = "del",
    exc = "exc"
}
export declare function modifyThsSelfStocksRequest(code: any, userid: any, ticket: any, user: any, type?: ThsOprate): Promise<any>;
export declare function promiseLimit(promises: any, limit: any): Promise<unknown>;
export {};
