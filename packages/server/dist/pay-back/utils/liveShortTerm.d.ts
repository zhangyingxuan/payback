interface PoolStock {
    code: string;
    name: string;
    is_again_limit?: number;
}
interface BoardGroup {
    height: number;
    code_list: {
        code: string;
    }[];
}
interface BlockStock {
    code: string;
    reason_type?: string;
    first_limit_up_time?: string;
}
interface Block {
    name: string;
    stock_list?: BlockStock[];
}
export declare function buildLiveShortTerm(stocks: PoolStock[], boards: BoardGroup[], blocks: Block[], counts?: {
    limitUp?: {
        rate?: number | null;
    };
    limitDown?: {
        num?: number | null;
    };
}): {
    dailyLimitQuantity: number;
    downLimitQuantity: number;
    sealingRate: number;
    dailyLimitReturnSealQuantity: number;
    evenBoardAmount: number;
    marketHeight: number;
    evenBoardData: string;
    createTime: Date;
};
export {};
