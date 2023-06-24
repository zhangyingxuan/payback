import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { ApiTestService } from './service/apiTest.service';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';
export declare class PayBackController {
    private readonly ShorTermService;
    private readonly fundsService;
    private readonly hotListService;
    private readonly apiTestService;
    private readonly marketService;
    constructor(ShorTermService: ShorTermService, fundsService: FundsService, hotListService: HotListService, apiTestService: ApiTestService, marketService: MarketService);
    testApi(): Promise<void>;
    crawlTodayData(): Promise<{
        shortData: import("./dto/create-pay-back.dto").CreatePayBackDto | {
            code: string;
            msg: string;
        };
        fundsData: import("./dto/create-funds-data.dto").CreateFundsDataDto | {
            code: string;
            msg: string;
        };
        marketData: import("./dto/create-market-data.dto").CreateMarketDataDto | {
            code: string;
            msg: string;
        };
    }>;
    crawlHotListData(): Promise<import("./dto/create-hot-list.dto").CreateHotListDto>;
    crawlShortTerm(): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto | {
        code: string;
        msg: string;
    }>;
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
    fetchEvenBoardData(query: any): Promise<{
        code: number;
        data: import("./entities/shortTermData.entity").shortTermData[];
    }>;
    fetchHostListData(query: any): Promise<{
        code: number;
        data: import("./entities/hotList.entity").hotList[];
    }>;
    findPlateByLimit(query: any): Promise<{
        code: number;
        data: import("./entities/marketData.entity").marketData[];
    }>;
    findAll(): Promise<import("./entities/shortTermData.entity").shortTermData[]>;
    findOne(id: string): Promise<string>;
    update(id: string, updatePayBackDto: UpdatePayBackDto): Promise<import("typeorm").UpdateResult>;
    remove(id: string): Promise<string>;
}
