import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
declare const _default: {
    getShortTermData(pageUrl: any, apiUrl: any): Promise<any>;
    getMarketData(pageUrl: any, apiUrls: any): Promise<CreateMarketDataDto>;
    getFundsData(): Promise<CreateFundsDataDto>;
};
export default _default;
