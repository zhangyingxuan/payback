import { Injectable, CACHE_MANAGER, Inject, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cache } from 'cache-manager';

const USER_IFNO = 'userInfo';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRp: Repository<User>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }
  private readonly logger = new Logger(UsersService.name);

  async findOne(user: any): Promise<any | undefined> {
    const result = await this.userRp.find({ where: { account: user.account, password: user.password } });
    return result[0];
  }

  async getUserByAccount(account: string): Promise<any | undefined> {
    // 添加缓存机制，先从缓存中获取用户信息，如果没有再从数据库取 2023-09-26 22:55:19
    // bug修复，多用户登陆，缓存信息需按用户 account 存储，仅支持单节点应用部署 2024-03-14 17:33:42
    let userInfo = await this.cacheManager.get(account);
    // console.log('userInfo1 = ', userInfo);
    if (!userInfo) {
      userInfo = await this.userRp.findOne({ where: { account: account } });
      // 缓存一天
      await this.cacheManager.set(account, userInfo, 1000 * 60 * 60 * 24);
      // console.log('userInfo2 = ', userInfo)
    }
    return userInfo;
  }
  /**
   * 清理用户信息缓存
   * @returns
   */
  async clearUserInfoCache(): Promise<any | undefined> {
    console.log('清理用户缓存成功');
    return await this.cacheManager.del(USER_IFNO);
  }
}
