import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { SchedulerTaskService } from './scheduler-task.service';
import { newsPushSchedulerTask, schedulerTaskList } from './config';

describe('定时任务交易日过滤', () => {
  let service: SchedulerTaskService;
  let registry: SchedulerRegistry;

  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    registry = new SchedulerRegistry();
    service = new SchedulerTaskService(registry);
  });

  afterEach(() => {
    registry.getCronJobs().forEach(job => job.stop());
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  async function trigger(name: string) {
    await (registry.getCronJob(name) as unknown as CronJob).fireOnTick();
  }

  it('同一任务在休市日跳过，下一交易日恢复执行', async () => {
    const callback = jest.fn();
    await service.executeTask('market', '0 0 9 * * *', callback);
    jest.setSystemTime(new Date('2026-10-01T09:00:00+08:00'));
    await trigger('market');
    expect(callback).not.toHaveBeenCalled();
    jest.setSystemTime(new Date('2026-10-08T09:00:00+08:00'));
    await trigger('market');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('热榜在未知年份仍执行，其余任务跳过且按天去重告警', async () => {
    jest.setSystemTime(new Date('2027-01-04T09:00:00+08:00'));
    const warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    const callback = jest.fn();
    const hotCallback = jest.fn();
    await service.executeTask('news', '0 0 9 * * *', callback);
    await service.executeTask('hot', '0 0 9 * * *', hotCallback, false, false);
    await trigger('news');
    await trigger('news');
    await trigger('hot');
    expect(callback).not.toHaveBeenCalled();
    expect(hotCallback).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledTimes(1);
    jest.setSystemTime(new Date('2027-01-05T09:00:00+08:00'));
    await trigger('news');
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('一次性任务休市跳过后删除，重复注册不替换已有任务', async () => {
    jest.setSystemTime(new Date('2026-10-10T09:00:00+08:00'));
    const callback = jest.fn();
    await service.executeTask('once', '0 0 9 * * *', callback, true);
    const original = registry.getCronJob('once');
    await service.executeTask('once', '0 0 10 * * *', callback);
    expect(registry.getCronJob('once')).toBe(original);
    await trigger('once');
    expect(callback).not.toHaveBeenCalled();
    expect(service.doesExist('cron', 'once')).toBe(false);
  });

  it('任务清单仅热榜豁免，慢回调保持防重入', async () => {
    expect(schedulerTaskList.filter(task => task.tradingDaysOnly === false).map(task => task.taskName))
      .toEqual(['autoCrawlHotListData']);
    expect(newsPushSchedulerTask.tradingDaysOnly).toBe(true);
    jest.setSystemTime(new Date('2026-10-08T09:00:00+08:00'));
    let finish: () => void;
    const callback = jest.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    await service.executeTask('slow', '0 0 9 * * *', callback);
    const first = trigger('slow');
    await trigger('slow');
    expect(callback).toHaveBeenCalledTimes(1);
    finish!();
    await first;
  });
});
