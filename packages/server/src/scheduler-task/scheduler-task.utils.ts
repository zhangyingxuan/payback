import { newsPushSchedulerTask } from '../scheduler-task/config';

/**
 * 开启或关闭定时任务
 * @param schedulerTaskService
 * @param isAutoPushNews
 */
export function toggleNewsPushEnableTask(schedulerTaskService, isAutoPushNews = 1) {
  // 先判断是否存在，存在则不添加
  const doesExist = schedulerTaskService.doesExist('cron', newsPushSchedulerTask.taskName);
  // 加入定时任务
  if (isAutoPushNews) {
    console.log('新闻推送定时任务执行了：' + newsPushSchedulerTask.cron);
    !doesExist &&
      schedulerTaskService.executeTask(newsPushSchedulerTask.taskName, newsPushSchedulerTask.cron, () => {
        this[newsPushSchedulerTask.service][newsPushSchedulerTask.func]();
      });
  } else {
    console.log('新闻推送定时任务关闭了：' + newsPushSchedulerTask.cron);
    doesExist && schedulerTaskService.deleteCron(newsPushSchedulerTask.taskName);
  }
}
