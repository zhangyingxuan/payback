import { Controller, Body, Req, Res, Post, Get, UseGuards, Logger, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/public.decorator';
import * as svgCaptcha from 'svg-captcha';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }
  private readonly logger = new Logger(AuthController.name);

  @Public()
  @Post('login')
  async login(@Body() body, @Req() req) {
    const { code } = body;
    const storedCaptcha = req.session.captcha;
    // this.logger.log('用户登录 验证码：storedCaptcha：' + storedCaptcha + '==code：' + code);

    if (code && storedCaptcha && code.toLowerCase() === storedCaptcha.toLowerCase()) {
      // 验证码校验成功
      return await this.authService.login(body, req);
    } else {
      // 验证码校验失败
      return {
        code: 200,
        data: {
          msg: '验证码错误',
        },
      };
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  // @Headers('x-real-ip') headerRealIP: string,
  // @Headers('X-Forwarded-For') XForwardedFor: string,
  @Public()
  @Get('getCode')
  getCode(@Res() res, @Req() req) {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      fontSize: 60,
      inverse: false,
      background: '#F5F7FA',
    });
    req.session.captcha = captcha.text;

    const ip = req.ip;
    const host = req.headers?.host;
    const headerRealIP: string = req?.headers['x-real-ip'];
    const XForwardedFor: string = req?.headers['X-Forwarded-For'];
    // this.logger.log('生产 验证码：' + req.session.captcha);
    this.logger.log(`生产 验证码：1234; ${ip} - ${host}; - ${headerRealIP}; - ${XForwardedFor}`);
    res.set('Content-Type', 'image/svg+xml');
    res.send(captcha.data);
  }
}
