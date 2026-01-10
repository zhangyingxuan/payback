import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) { }

  async validateUser(userInfo: LoginDTO): Promise<any> {
    const user = await this.usersService.findOne(userInfo);
    if (user) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: LoginDTO, req: any) {
    // const ipAddress = request.ip;
    const result = await this.validateUser(user);
    console.log(
      `用户登录：${result ? result.name : '失败'}` +
      user.account +
      ' ip：' +
      req.headers['x-forwarded-for'] +
      '--' +
      req.headers['x-real-ip'] +
      '--' +
      req.socket.remoteAddress,
    );
    // 验证码

    if (result) {
      const payload = { account: user.account };
      return {
        code: 0,
        data: {
          isAdmin: !!result.isAdmin,
          name: result.name,
          token: this.jwtService.sign(payload),
        },
      };
    } else {
      return {
        code: 0,
        data: {
          msg: '用户名或密码错误',
        },
      };
    }
  }
}
