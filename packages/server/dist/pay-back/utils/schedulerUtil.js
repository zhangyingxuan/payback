"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeTaskFunc = void 0;
const executeTaskFunc = async (self, task, retryTime) => {
    if (retryTime === 0)
        return;
    try {
        if (task.taskName === 'autoCrawlShortTermDataLatePm') {
            const result = await self[task.service][task.func]();
            process.env.NODE_ENV !== 'dev' &&
                (await self.thsService.autoModifyThsSelfStocks(JSON.parse(result.evenBoardData), 'admin'));
            return;
        }
        await self[task.service][task.func]();
    }
    catch (e) {
        self.qyWechatNotice.notice(task.service, `[${task.func}]出错了：${e}`);
        (0, exports.executeTaskFunc)(self, task, --retryTime);
    }
};
exports.executeTaskFunc = executeTaskFunc;
exports.default = {
    executeTaskFunc: exports.executeTaskFunc,
};
//# sourceMappingURL=schedulerUtil.js.map