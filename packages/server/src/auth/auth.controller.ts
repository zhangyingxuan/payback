import { Controller, Body, Req, Res, Request, Post, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/public.decorator';
import * as svgCaptcha from 'svg-captcha';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() body, @Req() req) {
    const { code } = body;
    const storedCaptcha = req.session.captcha;
    // console.log(storedCaptcha);

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
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get('getCode')
  getCode(@Res() res, @Req() req) {
    const captcha = svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true,
      fontSize: 80,
      inverse: false,
      background: '#F5F7FA',
    });
    req.session.captcha = captcha.text;
    res.set('Content-Type', 'image/svg+xml');
    res.send(captcha.data);
  }
}
