import { PushService } from './push.service';

describe('早盘推送', () => {
  it('飞书和企微均显示实际金额，并区分零封单与缺失金额', async () => {
    const service = new PushService();
    const feishu = jest.spyOn(service as unknown as { sendFeishu: () => Promise<void> }, 'sendFeishu')
      .mockResolvedValue(undefined);
    const wechat = jest.spyOn(service, 'pushMsg2Robot').mockResolvedValue([]);

    await service.pushMorningMessage({
      auctionLimitUp: [
        { code: '603324.SH', name: '盛剑科技', sealQuantity: 7480180, sealAmount: 207275787.8 },
        { code: '002420.SZ', name: '测试股一', sealAmount: 0 },
        { code: '000002.SZ', name: '测试股二', sealAmount: null },
        { code: '000003.SZ', name: '测试股三', sealAmount: 12000 },
      ],
    });

    for (const messages of [feishu.mock.calls, wechat.mock.calls]) {
      const content = JSON.stringify(messages);
      expect(content).toContain('2.07亿元');
      expect(content).toMatch(/封单金额 (?:<font color=\\"red\\">)?0元/);
      expect(content).toContain('暂无');
      expect(content).toContain('1.20万元');
    }
  });
});
