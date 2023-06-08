import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
import { CreateHotListDto } from '../dto/create-hot-list.dto';
import { CreatePayBackDto } from '../dto/create-pay-back.dto';
declare const _default: {
    getShortTermData(todayDateStr: any): Promise<CreatePayBackDto>;
    getMarketData(pageUrl: any, apiUrls: any): Promise<CreateMarketDataDto>;
    getFundsData(dateStr: any): Promise<CreateFundsDataDto>;
    getHotListData(): Promise<CreateHotListDto>;
};
export default _default;
