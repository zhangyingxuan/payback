"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonLength = exports.createDataHealth = exports.getExpectedTradeDate = void 0;
const dayjs = require("dayjs");
const tradeDateUtil_1 = require("./tradeDateUtil");
function getExpectedTradeDate(latestDate, now = new Date()) {
    const day = dayjs(now).day();
    return day === 0 || day === 6 ? (0, tradeDateUtil_1.toTradeDate)(latestDate || now) : (0, tradeDateUtil_1.toTradeDate)(now);
}
exports.getExpectedTradeDate = getExpectedTradeDate;
function createDataHealth(name, record, expectedDate, count) {
    if (!record)
        return { name, status: 'missing', tradeDate: expectedDate, count: 0 };
    const tradeDate = (0, tradeDateUtil_1.toTradeDate)(record.tradeDate || record.createTime);
    const status = tradeDate !== expectedDate ? 'stale' : count === 0 ? 'empty' : 'fresh';
    return { name, status, tradeDate, updatedTime: record.updatedTime || record.createTime, count };
}
exports.createDataHealth = createDataHealth;
function jsonLength(value) {
    if (!value)
        return 0;
    try {
        const data = JSON.parse(value);
        return Array.isArray(data) ? data.length : Object.keys(data || {}).length;
    }
    catch (_a) {
        return 0;
    }
}
exports.jsonLength = jsonLength;
//# sourceMappingURL=dataHealthUtil.js.map