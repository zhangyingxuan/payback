export type LiveSection = 'market' | 'funds' | 'shortTerm' | 'global';
export declare class LiveMarketService {
    private pending;
    get(section: LiveSection): Promise<unknown>;
    private fetch;
    private fetchLimitSectors;
    private fetchBlocks;
    private fetchThs;
    private fetchShortTerm;
    private fetchFunds;
}
