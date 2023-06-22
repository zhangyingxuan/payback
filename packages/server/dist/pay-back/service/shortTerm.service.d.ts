import { CreatePayBackDto } from '../dto/create-pay-back.dto';
import { UpdatePayBackDto } from '../dto/update-pay-back.dto';
import { Repository } from 'typeorm';
import { shortTermData } from '../entities/shortTermData.entity';
export declare class ShorTermService {
    private readonly shortTermDataRp;
    constructor(shortTermDataRp: Repository<shortTermData>);
    private readonly logger;
    crawlShortTermData(): Promise<CreatePayBackDto>;
    findAll(): Promise<shortTermData[]>;
    findByLimit(len?: number): Promise<shortTermData[]>;
    findEvenBoardByLimit(len?: number): Promise<shortTermData[]>;
    findOne(id: number): Promise<string>;
    update(id: number, updatePayBackDto: UpdatePayBackDto): Promise<import("typeorm").UpdateResult>;
    remove(id: number): Promise<string>;
}
