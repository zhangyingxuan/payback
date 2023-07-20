import { ShorTermService } from './service/shortTerm.service';
import { ThsService } from './service/ths.service';
import { ApiTestService } from './service/apiTest.service';
export declare class ThsTradeController {
    private readonly thsService;
    private readonly shorTermService;
    private readonly apiTestService;
    constructor(thsService: ThsService, shorTermService: ShorTermService, apiTestService: ApiTestService);
    modifyThsSelfStocks(): Promise<{
        code: number;
        data: any;
    }>;
}
