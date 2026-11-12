export const executeTaskFunc = async (self, task, retryTime) => {
  if (retryTime === 0) return;
  try {
    // 尾盘短线定时任务，根据系统配置，自动添加涨停个股（连板、首板）
    if (task.taskName === 'autoCrawlShortTermDataLatePm') {
      const result = await self[task.service][task.func]();
      process.env.NODE_ENV !== 'dev' &&
        (await self.thsService.autoModifyThsSelfStocks(JSON.parse(result.evenBoardData), 'admin'));
      return;
    }

    // 早盘 9:25 推送：采集新股 + 集合竞价涨停（按封单量排序），发飞书卡片
    if (task.taskName === 'autoPushMorningLimitUpMessage') {
      const result = await self[task.service][task.func]();
      self.pushServer.emit('pushMorningMessage', result);
      return;
    }

    await self[task.service][task.func]();
  } catch (e) {
    // 报错后 通知企微
    self.qyWechatNotice.notice(task.service, `[${task.func}]出错了：${e}`);
    // 双图的数据或通道可能尚未就绪，间隔重试并等待完成，防止调度锁提前释放。
    if (task.taskName === 'autoPushReviewCharts' && retryTime > 1) {
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    return executeTaskFunc(self, task, --retryTime);
  }
};

export default {
  executeTaskFunc,
};
