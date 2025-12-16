import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class DeployService {
  private readonly logger = new Logger(DeployService.name);

  constructor(private configService: ConfigService) { }

  async deploy(): Promise<{ stdout: string; stderr: string }> {
    const repoPath = this.configService.get<string>('REPO_PATH');
    const buildCmd = this.configService.get<string>('BUILD_CMD');

    this.logger.log(`Executing deployment in ${repoPath}`);
    this.logger.log(`Build command: ${buildCmd}`);

    try {
      // 1. 拉取最新代码
      this.logger.log('Pulling latest code...');
      const { stdout, stderr } = await execAsync('git pull', { cwd: repoPath });

      // 2. 执行构建命令，服务器资源紧张，将编译放置gitee
      // this.logger.log('Building project...');
      // const { stdout, stderr } = await execAsync(buildCmd, { cwd: repoPath });

      // this.logger.log('Deployment completed successfully');
      // this.logger.debug(`Build output: ${stdout}`);
      // if (stderr) this.logger.warn(`Build warnings: ${stderr}`);

      // await this.afterDeploy('client deploy success!');
      return { stdout, stderr };
    } catch (error) {
      this.logger.error(`Deployment failed: ${error.message}`);
      this.logger.error(`Error output: ${error.stderr}`);
      throw error;
    }
  }

  private async beforeDeploy() {
    this.logger.log('Running pre-deployment tasks...');
    // 备份当前版本、通知等
  }

  private async afterDeploy(result) {
    this.logger.log('Running post-deployment tasks...');
    // 清理缓存、发送通知等
  }
}