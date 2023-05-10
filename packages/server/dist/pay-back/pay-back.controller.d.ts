import { PayBackService } from './shortTerm.service';
import { MarketService } from './market.service';
import { FundsService } from './funds.service';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';
export declare class PayBackController {
    private readonly payBackService;
    private readonly fundsService;
    private readonly marketService;
    constructor(payBackService: PayBackService, fundsService: FundsService, marketService: MarketService);
    crawlShortTerm(): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto>;
    crawlMarket(): Promise<import("./dto/create-market-data.dto").CreateMarketDataDto | {
        code: string;
        msg: string;
    }>;
    crawlFunds(): Promise<import("./dto/create-funds-data.dto").CreateFundsDataDto | {
        code: string;
        msg: string;
    }>;
    findByLimit(query: any): Promise<{
        code: number;
        data: {
            shortTermData: import("./entities/shortTermData.entity").shortTermData[];
            marketData: import("./entities/marketData.entity").marketData[];
            fundsData: import("./entities/fundsData.entity").fundsData[];
        };
    }>;
    findAll(): Promise<import("./entities/shortTermData.entity").shortTermData[]>;
    findOne(id: string): Promise<string>;
    update(id: string, updatePayBackDto: UpdatePayBackDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<string>;
}
