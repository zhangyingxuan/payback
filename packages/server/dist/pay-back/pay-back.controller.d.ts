import { ShorTermService } from './service/shortTerm.service';
import { SpecialStockService } from './service/specialStock.service';
import { MarketService } from './service/market.service';
import { PlateService } from './service/plate.service';
import { FundsService } from './service/funds.service';
import { HotListService } from './service/hotList.service';
import { LatestConceptPlateService } from './service/latestConceptPlate.service';
import { ReviewService } from './service/review.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
import { UsersService } from '../users/users.service';
declare class CrawlTodayDataDto {
    fetchTodayDataType: number;
    isRemoveIncompatible: number;
}
export declare class PayBackController {
    private readonly shorTermService;
    private readonly specialStockService;
    private readonly fundsService;
    private readonly hotListService;
    private readonly reviewService;
    private readonly thsService;
    private readonly apiTestService;
    private readonly latestConceptPlateService;
    private readonly usersService;
    private readonly marketService;
    private readonly plateService;
    constructor(shorTermService: ShorTermService, specialStockService: SpecialStockService, fundsService: FundsService, hotListService: HotListService, reviewService: ReviewService, thsService: ThsService, apiTestService: ApiTestService, latestConceptPlateService: LatestConceptPlateService, usersService: UsersService, marketService: MarketService, plateService: PlateService);
    private readonly logger;
    testApi(): Promise<string>;
    autoCrawlTodayDataAM(): Promise<void>;
    autoCrawlTodayDataPM(): Promise<void>;
    crawlTodayData(body: CrawlTodayDataDto, req: any): Promise<{
        code: number;
        data: any;
    }>;
    crawlBinddingData(body: CrawlTodayDataDto, req: any): Promise<{
        code: number;
        data: any;
    }>;
    crawlHotListData(): Promise<{
        code: number;
        data: import("./dto/create-hot-list.dto").CreateHotListDto;
    }>;
    crawlShortTerm(): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto>;
    crawlShortTermByDate(query: any): Promise<import("./dto/create-pay-back.dto").CreatePayBackDto>;
    crawlMarket(): Promise<import("./dto/create-market-data.dto").CreateMarketDataDto>;
    crawlPlateData(): Promise<{
        code: number;
        data: import("./dto/create-Plate-data.dto").CreatePlateDataDto;
    }>;
    crawlFunds(): Promise<import("./dto/create-funds-data.dto").CreateFundsDataDto>;
    crawlLatestConceptPlate(): Promise<any>;
    findByLimit(query: any): Promise<{
        code: number;
        data: {
            shortTermData: any;
            marketData: any;
            fundsData: any;
        };
    }>;
    fetchEvenBoardData(query: any): Promise<{
        code: number;
        data: any[];
    }>;
    fetchHostListData(query: any): Promise<{
        code: number;
        data: any;
    }>;
    fetchReveiwDataByDate(query: any): Promise<{
        code: number;
        data: any;
    }>;
    findConceptPlateWithinNDays(query: any): Promise<{
        code: number;
        data: any;
    }>;
    findConceptPlateByLimit(query: any): Promise<{
        code: number;
        data: any;
    }>;
    findPlateByLimit(query: any): Promise<{
        code: number;
        data: any;
    }>;
    fetchPlateOrderByDailyLimit(query: any): Promise<{
        code: number;
        data: any;
    }>;
}
export {};
