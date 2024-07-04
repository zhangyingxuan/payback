import { Controller, Body, Req, Res, Request, Post, Get, UseGuards, Logger, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/public.decorator';
import * as svgCaptcha from 'svg-captcha';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RealIP } from 'nestjs-real-ip';
import { Request as ExpRequest } from 'express';

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

  @Public()
  @Get('getCode')
  getCode(
    @Res() res,
    @Req() req,
    @Request() request: ExpRequest,
    @RealIP() ip: string,
    @Headers('x-real-ip') headerRealIP: string,
    @Headers('X-Forwarded-For') XForwardedFor: string,
  ) {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      fontSize: 60,
      inverse: false,
      background: '#F5F7FA',
    });
    req.session.captcha = captcha.text;

    const requestIp = request.ip;
    const host = request.headers.host;
    // this.logger.log('生产 验证码：' + req.session.captcha);
    this.logger.log(`生产 验证码：1234; ${ip};${requestIp};${host}; - ${headerRealIP}; - ${XForwardedFor}`);
    res.set('Content-Type', 'image/svg+xml');
    res.send(captcha.data);
  }
}
