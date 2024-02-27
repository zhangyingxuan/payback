import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { systemConfig } from '../entities/systemConfig.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SystemConfigService {
  constructor(@InjectRepository(systemConfig) private readonly sysTemconfigServiceRp: Repository<systemConfig>) { }

  private readonly logger = new Logger(SystemConfigService.name);

  async findAll() {
    return await this.sysTemconfigServiceRp.find();
  }
  /**
   * 查找最新的一条
   * @returns
   */
  async findLatestOne() {
    return await this.sysTemconfigServiceRp
      .createQueryBuilder('system_config')
      .offset(0)
      .limit(1)
      .orderBy('createTime', 'DESC')
      .getOne();
  }
}
