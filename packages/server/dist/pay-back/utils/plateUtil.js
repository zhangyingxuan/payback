"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const create_plate_data_dto_1 = require("../dto/create-plate-data.dto");
const fetchUtil_1 = require("../core/fetchUtil");
const config_1 = require("../core/config");
const commonUtil_1 = require("./commonUtil");
function getPlateTop(platesData, dateStr, len = 5) {
    return platesData.splice(0, len).map(item => {
        return {
            name: item['指数简称'],
            code: item['code'],
            turnover: commonUtil_1.default.fundsToFixed(item[`指数@成交额[${dateStr}]`]),
            num: item[`指数@涨停家数[${dateStr}]`],
            quoteChange: commonUtil_1.default.toFixed(item[`指数@涨跌幅:前复权[${dateStr}]`] || '0.0'),
        };
    });
}
exports.default = {
    async getPlateData(dateStr, cookie) {
        const createPlateDataDto = new create_plate_data_dto_1.CreatePlateDataDto();
        const gainianDailyLimit = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.gainianPlateOrderByDailyLimitNum + commonUtil_1.default.ignoreGainianPlateStr, 5, cookie);
        const hangyeDailyLimit = (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.hangyePlateOrderByDailyLimitNum, 5, cookie);
        const [gainianDailyLimitData, hangyeDailyLimitData] = await Promise.all([gainianDailyLimit, hangyeDailyLimit]);
        const gainianDailyLimitDataTop = getPlateTop(gainianDailyLimitData, dateStr);
        const hangyeDailyLimitDataTop = getPlateTop(hangyeDailyLimitData, dateStr);
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