"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const create_plate_data_dto_1 = require("../dto/create-plate-data.dto");
const fetchUtil_1 = require("../core/fetchUtil");
const config_1 = require("../core/config");
const commonUtil_1 = require("./commonUtil");
function readNumber(value) {
    return typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : NaN;
}
function parsePlateTop(response, dateStr, isConcept) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const content = (_e = (_d = (_c = (_b = (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.answer) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.txt) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.content;
    if (content === '没有找到符合条件的结果！')
        return [];
    const table = (_g = (_f = content === null || content === void 0 ? void 0 : content.components) === null || _f === void 0 ? void 0 : _f[0]) === null || _g === void 0 ? void 0 : _g.data;
    const rows = table === null || table === void 0 ? void 0 : table.datas;
    const total = (_j = (_h = table === null || table === void 0 ? void 0 : table.meta) === null || _h === void 0 ? void 0 : _h.extra) === null || _j === void 0 ? void 0 : _j.row_count;
    if (!Array.isArray(rows) || !Number.isInteger(total) || total < rows.length || (!rows.length && total > 0)) {
        throw new Error(`问财板块榜单响应异常（${dateStr}）`);
    }
    const candidates = rows.map(row => {
        const name = row === null || row === void 0 ? void 0 : row['指数简称'];
        const code = row === null || row === void 0 ? void 0 : row.code;
        const num = readNumber(row === null || row === void 0 ? void 0 : row[`指数@涨停家数[${dateStr}]`]);
        const turnover = readNumber(row === null || row === void 0 ? void 0 : row[`指数@成交额[${dateStr}]`]);
        const quoteChange = readNumber(row === null || row === void 0 ? void 0 : row[`指数@涨跌幅:前复权[${dateStr}]`]);
        if (typeof name !== 'string' ||
            !name ||
            typeof code !== 'string' ||
            !code ||
            !Number.isInteger(num) ||
            num < 1 ||
            !Number.isFinite(turnover) ||
            turnover < 0) {
            throw new Error(`问财板块榜单缺少有效的 ${dateStr} 数据`);
        }
        return { name, code, num, turnover, quoteChange };
    });
    const top = candidates
        .filter(({ name }) => !isConcept || !commonUtil_1.default.ignoreGainianPlates.some(keyword => name.includes(keyword)))
        .sort((a, b) => b.num - a.num || b.turnover - a.turnover || a.code.localeCompare(b.code))
        .slice(0, 5);
    if (total > candidates.length &&
        (top.length < 5 ||
            candidates.some(({ num }, index) => index > 0 && num > candidates[index - 1].num) ||
            candidates[candidates.length - 1].num >= top[4].num)) {
        throw new Error(`问财板块榜单候选范围不足（${dateStr}）`);
    }
    return top.map((_a) => {
        var { turnover, quoteChange } = _a, plate = __rest(_a, ["turnover", "quoteChange"]);
        return (Object.assign(Object.assign({}, plate), { turnover: commonUtil_1.default.fundsToFixed(String(turnover)), quoteChange: Number.isFinite(quoteChange) ? commonUtil_1.default.toFixed(String(quoteChange)) : null }));
    });
}
async function getPlateTop(question, dateStr, isConcept = false) {
    let best;
    let lastError;
    for (let attempt = 0; attempt < 3; attempt++) {
        const response = await (0, fetchUtil_1.fetchIwencai)(question, 100, true);
        try {
            const top = parsePlateTop(response, dateStr, isConcept);
            if (top.length && top.every(plate => plate.quoteChange !== null))
                return top;
            if (!best ||
                top.length > best.length ||
                (top.length === best.length &&
                    top.filter(plate => plate.quoteChange !== null).length >
                        best.filter(plate => plate.quoteChange !== null).length)) {
                best = top;
            }
        }
        catch (error) {
            lastError = error;
        }
    }
    if ((best === null || best === void 0 ? void 0 : best.length) || (best && !lastError))
        return best;
    throw lastError;
}
exports.default = {
    async getPlateData(dateStr) {
        const createPlateDataDto = new create_plate_data_dto_1.CreatePlateDataDto();
        const [gainianDailyLimitDataTop, hangyeDailyLimitDataTop] = await Promise.all([
            getPlateTop(config_1.params.gainianPlateOrderByDailyLimitNum, dateStr, true),
            getPlateTop(config_1.params.hangyePlateOrderByDailyLimitNum, dateStr),
        ]);
        createPlateDataDto.gainianDailyLimitData = JSON.stringify(gainianDailyLimitDataTop);
        createPlateDataDto.gainianDailyLimitNum =
            gainianDailyLimitDataTop && gainianDailyLimitDataTop[0] ? gainianDailyLimitDataTop[0].num : 0;
        createPlateDataDto.hangyeDailyLimitData = JSON.stringify(hangyeDailyLimitDataTop);
        createPlateDataDto.hangyeDailyLimitNum =
            hangyeDailyLimitDataTop && hangyeDailyLimitDataTop[0] ? hangyeDailyLimitDataTop[0].num : 0;
        createPlateDataDto.createTime = new Date();
        return createPlateDataDto;
    },
};
//# sourceMappingURL=plateUtil.js.map