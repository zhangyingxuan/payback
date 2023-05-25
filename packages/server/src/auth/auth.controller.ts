import { Controller, Body, Request, Post, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../decorator/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Public()
  @Post('login')
  async login(@Body() body) {
    return this.authService.login(body);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
