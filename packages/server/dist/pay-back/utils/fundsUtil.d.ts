import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
declare const _default: {
    getFundsData(dateStr: string): Promise<CreateFundsDataDto>;
    getMarketTurnover(responseMarketTurnoverStr: any): any;
    getPlateTop(platesData: any, dateStr: any, len?: number): any;
};
export default _default;
