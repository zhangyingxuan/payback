"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleNewsPushEnableTask = void 0;
const config_1 = require("../scheduler-task/config");
function toggleNewsPushEnableTask(schedulerTaskService, isAutoPushNews = 1) {
    const doesExist = schedulerTaskService.doesExist('cron', config_1.newsPushSchedulerTask.taskName);
    if (isAutoPushNews) {
        console.log('新闻推送定时任务执行了：' + config_1.newsPushSchedulerTask.cron);
        !doesExist &&
            schedulerTaskService.executeTask(config_1.newsPushSchedulerTask.taskName, config_1.newsPushSchedulerTask.cron, () => {
                this[config_1.newsPushSchedulerTask.service][config_1.newsPushSchedulerTask.func]();
            });
    }
    else {
        console.log('新闻推送定时任务关闭了：' + config_1.newsPushSchedulerTask.cron);
        doesExist && schedulerTaskService.deleteCron(config_1.newsPushSchedulerTask.taskName);
    }
}
exports.toggleNewsPushEnableTask = toggleNewsPushEnableTask;
//# sourceMappingURL=scheduler-task.utils.js.map