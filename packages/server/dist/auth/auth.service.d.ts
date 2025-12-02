import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(userInfo: LoginDTO): Promise<any>;
    login(user: LoginDTO, req: any): Promise<{
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
}
