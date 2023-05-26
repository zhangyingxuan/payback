import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRp: Repository<User>
  ) { }

  async findOne(user: any): Promise<any | undefined> {
    console.log(`用户登录：` + user);
    const result = await this.userRp.find({ where: { account: user.account, password: user.password } })
    return result[0];
  }
}