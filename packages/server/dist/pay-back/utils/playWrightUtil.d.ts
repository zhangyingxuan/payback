import { CreateMarketDataDto } from '../dto/create-market-data.dto';
import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
declare const _default: {
    getMarketData(dateStr: any): Promise<CreateMarketDataDto>;
    getFundsData(dateStr: any): Promise<CreateFundsDataDto>;
    getLatestConceptPlate(currentLatestConceptPlate: any): Promise<any>;
};
export default _default;
