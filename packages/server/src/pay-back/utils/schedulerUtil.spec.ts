import { executeTaskFunc } from './schedulerUtil';

describe('双图任务失败重试', () => {
  afterEach(() => jest.useRealTimers());

  it('等待 30 秒并保持任务未结束，成功后停止重试', async () => {
    jest.useFakeTimers({ doNotFake: ['performance'] });
    const pushDailyCharts = jest.fn().mockRejectedValueOnce(new Error('数据未就绪')).mockResolvedValue(undefined);
    const self = { reviewChartsService: { pushDailyCharts }, qyWechatNotice: { notice: jest.fn() } };
    const task = { taskName: 'autoPushReviewCharts', service: 'reviewChartsService', func: 'pushDailyCharts' };
    let finished = false;
    const running = executeTaskFunc(self, task, 3).then(() => { finished = true; });
    // 等待异步失败进入重试分支后再推进时钟。
    for (let index = 0; index < 5; index++) await Promise.resolve();
    expect(finished).toBe(false);
    expect(pushDailyCharts).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(30000);
    await running;
    expect(pushDailyCharts).toHaveBeenCalledTimes(2);
    expect(finished).toBe(true);
  });
});
