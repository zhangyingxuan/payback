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
   * 更新配置
   * @returns
   */
  async updateSystemConfig(systemConfigDto) {
    const currentConfig = await this.findLatestOne();
    // TODO 校验参数？
    let result;

    try {
      this.logger.debug('updateSystemConfig 更新数据 start');
      await this.sysTemconfigServiceRp.update(currentConfig.id, systemConfigDto);

      this.logger.debug('updateSystemConfig is success!');
      result = '更新成功';
    } catch (e) {
      this.logger.error('出错啦！！！', e);
      result = '出错啦！！！' + e;
    }
    return result;
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
