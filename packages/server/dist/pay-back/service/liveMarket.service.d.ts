export type LiveSection = 'market' | 'funds' | 'shortTerm' | 'global' | 'turnover' | 'stocks' | 'commodities';
export declare class LiveMarketService {
    private pending;
    get(section: LiveSection): Promise<unknown>;
    private fetch;
    private fetchTencentGlobal;
    private fetchAsiaGlobal;
    private fetchLimitSectors;
    private fetchBreadth;
    private fetchTurnover;
    private fetchEastmoney;
    private fetchTopStocks;
    private fetchCommoditySectors;
    private fetchBlocks;
    private fetchThs;
    private fetchShortTerm;
    private fetchFunds;
}
