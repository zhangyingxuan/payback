import { ClientProxy } from '@nestjs/microservices';
export declare class ReviewChartsService {
    private readonly pushServer;
    private readonly logger;
    private snapshot?;
    constructor(pushServer: ClientProxy);
    pushDailyCharts(): Promise<void>;
}
