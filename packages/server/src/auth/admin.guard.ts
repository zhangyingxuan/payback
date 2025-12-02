import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 检查用户是否为管理员
    if (!user || !user.isAdmin) {
      throw new ForbiddenException('权限不足：仅管理员可执行此操作');
    }

    return true;
  }
}