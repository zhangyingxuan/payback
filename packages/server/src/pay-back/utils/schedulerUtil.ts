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

    await self[task.service][task.func]();
  } catch (e) {
    // 报错后 通知企微
    self.qyWechatNotice.notice(task.service, `[${task.func}]出错了：${e}`);
    // 重试
    executeTaskFunc(self, task, --retryTime);
  }
};

export default {
  executeTaskFunc,
};
