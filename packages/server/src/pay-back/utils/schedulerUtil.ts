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

    // 早盘推送：采集新股和集合竞价涨停，按竞价封单量排序。
    if (task.taskName === 'autoPushMorningLimitUpMessage') {
      const result = await self[task.service][task.func]();
      self.pushServer.emit('pushMorningMessage', result);
      return;
    }

    await self[task.service][task.func]();
  } catch (e) {
    // 报错后 通知企微
    self.qyWechatNotice.notice(task.service, `[${task.func}]出错了：${e}`);
    // 上游数据或通道可能尚未就绪，间隔重试时保持调度锁。
    if (['autoPushReviewCharts', 'autoPushMorningLimitUpMessage'].includes(task.taskName) && retryTime > 1) {
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    return executeTaskFunc(self, task, --retryTime);
  }
};

export default {
  executeTaskFunc,
};
