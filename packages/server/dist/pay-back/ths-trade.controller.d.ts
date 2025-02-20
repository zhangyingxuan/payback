import { ShorTermService } from './service/shortTerm.service';
import { ThsService } from './service/ths.service';
export declare class ThsTradeController {
    private readonly thsService;
    private readonly shorTermService;
    constructor(thsService: ThsService, shorTermService: ShorTermService);
    modifyThsSelfStocks(req: any): Promise<{
        code: number;
    }>;
    addThsSelfStock(code: string, req: any): Promise<{
        code: number;
        data: string;
    }>;
    delThsSelfStock(code: string, req: any): Promise<{
        code: number;
        data: string;
    }>;
    addThsSelfPlate(code: string, req: any): Promise<{
        code: number;
        data: string;
    }>;
    delThsSelfPlate(code: string, req: any): Promise<{
        code: number;
        data: string;
    }>;
    addThsSelfPlateByNameCn(plateNameCn: string, req: any): Promise<{
        code: number;
        data: string;
    }>;
    delThsSelfPlateByNameCn(plateNameCn: string, req: any): Promise<{
        code: number;
        data: string;
    }>;
}
