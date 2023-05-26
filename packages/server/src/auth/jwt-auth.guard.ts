import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { AuthGuard, IAuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './constants';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) { }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    //    在这里取metadata中的no-auth，得到的会是一个bool
    const noAuth = this.reflector.get<boolean>(IS_PUBLIC_KEY, context.getHandler());

    if (noAuth) return true;

    return new (AuthGuard('jwt'))().canActivate(context);    //    执行所选策略Guard的canActivate方法
  }
}