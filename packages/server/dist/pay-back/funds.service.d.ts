import { Repository } from 'typeorm';
import { fundsData } from './entities/fundsData.entity';
import { CreateFundsDataDto } from './dto/create-funds-data.dto';
export declare class FundsService {
    private readonly fundsDataRp;
    constructor(fundsDataRp: Repository<fundsData>);
    private readonly logger;
    crawlfundsData(): Promise<CreateFundsDataDto | {
        code: string;
        msg: string;
    }>;
    findAll(): Promise<fundsData[]>;
    findByLimit(len?: number): Promise<fundsData[]>;
}
