import fetch from 'node-fetch';
import { of } from 'rxjs';
import { ReviewChartsService } from './reviewCharts.service';
import { schedulerTaskList } from '../../scheduler-task/config';

jest.mock('node-fetch', () => ({ __esModule: true, default: jest.fn() }));
const request = fetch as unknown as jest.Mock;

describe('收盘双图调度', () => {
  beforeEach(() => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    jest.setSystemTime(new Date('2026-11-12T07:38:00Z'));
    request.mockReset();
  });
  afterEach(() => jest.useRealTimers());

  it('15:38 交易日推送，资金提前在 15:32 采集', () => {
    expect(schedulerTaskList.find(task => task.taskName === 'autoPushReviewCharts')).toMatchObject({
      service: 'reviewChartsService', func: 'pushDailyCharts', cron: '0 38 15 * * 1-5', tradingDaysOnly: true,
    });
    expect(schedulerTaskList.find(task => task.taskName === 'autoCrawlfundsDataLateSession').cron).toBe('0 32 15 * * 1-5');
  });

  it('按北京时间请求双图，重试复用同一快照并检查推送回执', async () => {
    const charts = { data_as_of: '2026-11-12', charts: [] };
    request.mockResolvedValue({ ok: true, json: async () => charts });
    const push: any = { send: jest.fn().mockReturnValueOnce(of({ ok: false, failures: ['feishu:0'] })).mockReturnValue(of({ ok: true })) };
    const service = new ReviewChartsService(push);
    await expect(service.pushDailyCharts()).rejects.toThrow('feishu:0');
    await expect(service.pushDailyCharts()).resolves.toBeUndefined();
    expect(request).toHaveBeenCalledTimes(1);
    expect(request.mock.calls[0][0]).toMatch(/\/review-charts\/2026-11-12$/);
    expect(push.send).toHaveBeenLastCalledWith('pushReviewCharts', charts);
  });

  it('数据未就绪或日期错误不能调用机器人', async () => {
    const push: any = { send: jest.fn() };
    const service = new ReviewChartsService(push);
    request.mockResolvedValueOnce({ ok: false, json: async () => ({ error: '收盘数据未就绪' }) });
    await expect(service.pushDailyCharts()).rejects.toThrow('收盘数据未就绪');
    request.mockResolvedValueOnce({ ok: true, json: async () => ({ data_as_of: '2026-11-11', charts: [] }) });
    await expect(service.pushDailyCharts()).rejects.toThrow('日期');
    expect(push.send).not.toHaveBeenCalled();
  });
});
