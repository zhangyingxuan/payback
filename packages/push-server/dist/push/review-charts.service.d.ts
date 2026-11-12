/// <reference types="node" />
/// <reference types="node" />
import { PushService } from './push.service';
interface ChartPayload {
    data_as_of: string;
    charts: {
        name: string;
        svg_base64: string;
    }[];
}
export declare function renderChartParts(encoded: string): Promise<Buffer[]>;
export declare class ReviewChartsPushService {
    private readonly pushService;
    private readonly logger;
    private date;
    private sent;
    private uploaded;
    private pending?;
    constructor(pushService: PushService);
    push(payload: ChartPayload): Promise<{
        ok: boolean;
        failures: string[];
    }>;
    private deliver;
    private pause;
    private getToken;
    private upload;
}
export {};
