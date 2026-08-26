import { CreateFundsDataDto } from '../dto/create-funds-data.dto';
declare const _default: {
    getFundsData(dateStr: string, cookie: string): Promise<CreateFundsDataDto>;
    getPlateTop(platesData: any, currentDateStr: any, len?: number): any;
};
export default _default;
