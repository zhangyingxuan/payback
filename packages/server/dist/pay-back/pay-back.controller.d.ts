import { ShorTermService } from './service/shortTerm.service';
import { MarketService } from './service/market.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { ApiTestService } from './service/apiTest.service';
import { UpdatePayBackDto } from './dto/update-pay-back.dto';
export declare class PayBackController {
    private readonly ShorTermService;
    private readonly fundsService;
    private readonly hotListService;
    private readonly reviewService;
    private readonly apiTestService;
    private readonly latestConceptPlateService;
    private readonly marketService;
    constructor(ShorTermService: ShorTermService, fundsService: FundsService, hotListService: HotListService, reviewService: ReviewService, apiTestService: ApiTestService, latestConceptPlateService: LatestConceptPlateService, marketService: MarketService);
    testApi(): Promise<void>;
    crawlTodayData(): Promise<{
        shortData: import("./dto/create-pay-back.dto").CreatePayBackDto;
        fundsData: import("./dto/create-funds-data.dto").CreateFundsDataDto;
        marketData: import("./dto/create-market-data.dto").CreateMarketDataDto;
    }>;
    crawlHotListData(): Promise<{
        code: number;
        data: {
            createTime: string;
            stockNormal: string;
            stockValue: string;
            plateConcept: string;
            plateIndustry: string;
            updatedTime: Date;
        };
    }>;
    crawlShortTerm(): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto>;
    crawlShortTermDataByDate(query: any): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto | {
        code: string;
        msg: string;
    }>;
    crawlMarket(): Promise<import("./dto/create-market-data.dto").CreateMarketDataDto>;
    crawlFunds(): Promise<import("./dto/create-funds-data.dto").CreateFundsDataDto>;
    crawlLatestConceptPlate(): Promise<any>;
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
    fetchReveiwDataByDate(query: any): Promise<{
        code: number;
        data: import("./entities/review.entity").reviewData;
    }>;
    findPlateByLimit(query: any): Promise<{
        code: number;
        data: import("./entities/marketData.entity").marketData[];
    }>;
    findAll(): Promise<import("./entities/shortTermData.entity").shortTermData[]>;
    update(id: string, updatePayBackDto: UpdatePayBackDto): Promise<import("typeorm").UpdateResult>;
}
