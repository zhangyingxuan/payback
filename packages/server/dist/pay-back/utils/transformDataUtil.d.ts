export declare function transformStockData(stockList: any): string;
export declare function transformPlateData(plateList: any): string;
export declare function transformShortTermSourceData(dailyLimitData: any, downLimitData: any, todayDateStr: any): {
    SZAmount: number;
    SHAmount: number;
    board1: number;
    maxHeight: number;
    evenBoardData: {
        maxHeight: number;
        gaobiao: any[];
    };
    downLimitDataArr: any[];
};
