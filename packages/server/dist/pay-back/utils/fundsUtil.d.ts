declare const _default: {
    transformForeignFunds(dataStr: any): {
        northFundsAmtIn: number;
        southFundsAmtIn: number;
        northFundsBuyAmt: number;
        southFundsBuyAmt: number;
    };
    getMarketTurnover(responseMarketTurnoverStr: any): any;
    getPlateTop3(responseJson: any, dateStr: any): {
        name: any;
        code: any;
        funds: number;
        quoteChange: any;
    }[];
};
export default _default;
