import { ShorTermService } from './service/shortTerm.service';
import { ThsService } from './service/ths.service';
export declare class ThsTradeController {
    private readonly thsService;
    private readonly shorTermService;
    constructor(thsService: ThsService, shorTermService: ShorTermService);
    modifyThsSelfStocks(): Promise<{
        code: number;
        data: any;
    }>;
    addThsSelfStock(code: string): Promise<{
        code: number;
        data: any;
    } | {
        code: number;
        data?: undefined;
    }>;
    delThsSelfStock(code: string): Promise<{
        code: number;
        data: any;
    } | {
        code: number;
        data?: undefined;
    }>;
}
