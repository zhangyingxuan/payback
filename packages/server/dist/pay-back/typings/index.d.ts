export interface PaginateDto {
    page: number;
    limit: number;
}
export interface DailyLimitStockDto {
    name: string;
    code: string;
    reason: string;
    turnover: number;
    closingFunds: number;
}
