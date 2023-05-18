import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
declare const _default: {
    getShortTermData(todayDateStr: any): Promise<CreatePayBackDto>;
    getMarketData(pageUrl: any, apiUrls: any): Promise<CreateMarketDataDto>;
    getFundsData(dateStr: any): Promise<CreateFundsDataDto>;
};
export default _default;
