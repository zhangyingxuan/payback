import {
  Get,
  Query,
  Controller,
  Post,
  Body,
  Headers,
  HttpException,
  HttpStatus,
  Logger,
  Inject
} from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { DeployService } from '../deploy/deploy.service';
import { WebhookDto } from './dto/webhook.dto';
import { ClientProxy } from '@nestjs/microservices';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly deployService: DeployService,
    // 推送服务
    @Inject('PUSH_SERVER') private pushServer: ClientProxy,
  ) { }

  @Get('generateSignature')
  generateSignature(@Query('secret') secret: string) {
    return this.webhookService.generateSignature(secret)
  }

  @Post()
  async handleWebhook(
    @Body() payload: WebhookDto,
    @Headers('X-Gitee-Token') signature: string,
    @Headers('X-Gitee-Timestamp') timestamp: string,
    @Headers('X-Gitee-Event') eventType: string
  ) {
    this.logger.debug(`Actual payload structure: ${JSON.stringify(payload)}`);
    try {
      // 1. 验证事件类型
      if (eventType !== 'push') {
        this.logger.warn(`Ignored event: ${eventType}`);
        throw new HttpException(`Unsupported event type: ${eventType}`, HttpStatus.BAD_REQUEST);
      }

      // 2. 验证签名
      if (!this.webhookService.verifySignature(timestamp, signature, 3000000)) {
        this.logger.warn('Invalid signature received');
        throw new HttpException('Invalid signature', HttpStatus.FORBIDDEN);
      }

      // 3. 检查分支
      const targetBranch = process.env.TARGET_BRANCH || 'refs/heads/master';
      if (payload.ref !== targetBranch) {
        this.logger.log(`Skipped non-target branch: ${payload.ref} (target: ${targetBranch})`);
        return { status: 'skipped', reason: 'non-target-branch' };
      }

      // 4. 检查变更文件
      if (!payload.commits || payload.commits.length === 0) {
        this.logger.log('No commits in push event');
        return { status: 'skipped', reason: 'no-commits' };
      }

      const hasWatchDirChange = this.webhookService.isWatchDirChanged(payload.commits);
      if (!hasWatchDirChange) {
        this.logger.log(`No changes in watched directories: ${process.env.WATCH_DIRS}`);
        return { status: 'skipped', reason: 'no-watched-changes' };
      }

      // 5. 执行部署
      this.logger.log('Starting deployment...');
      const result = await this.deployService.deploy();

      const responseData = {
        status: 'success',
        message: 'Deployment completed successfully',
        details: result
      };
      // 推送构建结果
      this.pushServer.send('notice', { ...responseData, details: undefined });
      return responseData;
    } catch (error) {
      this.logger.error(`Webhook processing failed: ${error.message}`, error.stack);
      this.pushServer.send('notice', { status: 'failed', message: error.message });
      throw new HttpException(
        error.response || 'Internal server error',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}