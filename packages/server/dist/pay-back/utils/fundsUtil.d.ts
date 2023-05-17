declare const _default: {
    transformForeignFunds(response: any): Promise<{
        northFundsAmtIn: number;
        southFundsAmtIn: number;
        northFundsBuyAmt: number;
        southFundsBuyAmt: number;
    }>;
    getMarketTurnover(response: any): Promise<any>;
    getPlateTop3(response: any, dateStr: any): Promise<{
        name: any;
        code: any;
        funds: number;
        quoteChange: any;
    }[]>;
};
export default _default;
