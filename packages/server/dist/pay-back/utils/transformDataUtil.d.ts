export declare function transformStockData(stockList: any): string;
export declare function transformPlateData(plateList: any): string;
export declare function transformShortTermSourceData(dailyLimitData: any, downLimitData: any, todayDateStr: any): {
    board1: number;
    evenBoardData: {
        maxHeight: number;
        gaobiao: any[];
    };
    downLimitDataArr: any[];
    downLimitQuantity: number;
    dailyLimitReturnSealQuantity: number;
};
