import { AppService } from './app.service';
import { Wechaty } from 'wechaty';
export declare class AppController {
    private readonly appService;
    private readonly botInstance;
    constructor(appService: AppService, botInstance: Wechaty);
    pushMessage(query: any): Promise<{
        code: number;
        msg?: undefined;
    } | {
        code: number;
        msg: string;
    }>;
}
