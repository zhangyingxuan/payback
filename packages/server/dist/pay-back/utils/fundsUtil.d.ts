declare const _default: {
    transformForeignFunds(dataStr: any): {
        northFundsAmtIn: number;
        southFundsAmtIn: number;
        northFundsBuyAmt: number;
        southFundsBuyAmt: number;
    };
    getMarketTurnover(responseMarketTurnoverStr: any): any;
    getPlateTop(responseJson: any, dateStr: any, len?: number): {
        name: any;
        code: any;
        funds: number;
        quoteChange: any;
    }[];
};
export default _default;
