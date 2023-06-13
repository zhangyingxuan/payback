import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        code: number;
        data: {
            token: string;
            msg?: undefined;
        };
    } | {
        code: number;
        data: {
            msg: string;
            token?: undefined;
        };
    }>;
    getProfile(req: any): any;
}
