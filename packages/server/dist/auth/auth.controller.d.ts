import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    private readonly logger;
    login(body: any, req: any, headerRealIP: string): Promise<{
        code: number;
        data: {
            isAdmin: boolean;
            name: any;
            token: string;
            msg?: undefined;
        };
    } | {
        code: number;
        data: {
            msg: string;
            isAdmin?: undefined;
            name?: undefined;
            token?: undefined;
        };
    }>;
    getProfile(req: any): any;
    getCode(res: any, req: any): void;
}
