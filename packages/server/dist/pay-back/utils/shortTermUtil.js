"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getShortTermDataByDate = exports.getShortTermData = void 0;
const create_pay_back_dto_1 = require("../dto/create-pay-back.dto");
const transformDataUtil_1 = require("../utils/transformDataUtil");
const config_1 = require("../core/config");
const fetchUtil_1 = require("../core/fetchUtil");
async function getShortTermData(todayDateStr) {
    let createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
    const dailyLimitData = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.dailyLimitMoreThan1, 100, false);
    const downLimitData = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.downLimit, 50, false);
    const dailyLimitOpenData = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.dailyLimitOpen, 50, false);
    let { board1 = 0, evenBoardData, downLimitDataArr, dailyLimitReturnSealQuantity } = (0, transformDataUtil_1.transformShortTermSourceData)(dailyLimitData, downLimitData, todayDateStr);
    createPayBackDto.downLimitQuantity = downLimitData.length;
    createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
    createPayBackDto.dailyLimitOpenQuantity = dailyLimitOpenData.length;
    createPayBackDto.sealingRate = Math.round(dailyLimitData.length / (dailyLimitData.length + dailyLimitOpenData.length) * 100);
    createPayBackDto.dailyLimitReturnSealQuantity = dailyLimitReturnSealQuantity;
    createPayBackDto.marketHeight = evenBoardData.maxHeight;
    createPayBackDto.board1 = board1;
    createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
    createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
    createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
    createPayBackDto.createTime = new Date();
    createPayBackDto.cycle = getCurrentCycle(createPayBackDto);
    return createPayBackDto;
}
exports.getShortTermData = getShortTermData;
function getCurrentCycle(item) {
    const cycles = ['启动', '发酵', '高潮', '退潮', '冰点'];
    const maxHeight = item.marketHeight;
    if (maxHeight <= 4) {
        if (item.downLimitQuantity > 10) {
            return cycles[4];
        }
        if (maxHeight === 4) {
            return cycles[0];
        }
        return cycles[3];
    }
    if (maxHeight >= 5) {
        if (item.evenBoardAmount >= 10 || item.dailyLimitQuantity >= 45) {
            return cycles[2];
        }
        return cycles[1];
    }
}
async function getShortTermDataByDate(todayDateStr) {
    let createPayBackDto = new create_pay_back_dto_1.CreatePayBackDto();
    const dailyLimitData = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr), 100, false);
    const downLimitData = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.params.downLimitByDate.replace('${date}', todayDateStr), 50, false);
    console.log(config_1.params.dailyLimitMoreThan1ByDate.replace('${date}', todayDateStr));
    let { board1 = 0, evenBoardData, downLimitDataArr } = (0, transformDataUtil_1.transformShortTermSourceData)(dailyLimitData, downLimitData, todayDateStr);
    createPayBackDto.downLimitQuantity = downLimitData.length;
    createPayBackDto.dailyLimitQuantity = dailyLimitData.length;
    createPayBackDto.marketHeight = evenBoardData.maxHeight;
    createPayBackDto.board1 = board1;
    createPayBackDto.evenBoardAmount = dailyLimitData.length - board1;
    createPayBackDto.evenBoardData = JSON.stringify(evenBoardData);
    createPayBackDto.downLimitData = JSON.stringify(downLimitDataArr);
    createPayBackDto.createTime = new Date(todayDateStr);
    return createPayBackDto;
}
exports.getShortTermDataByDate = getShortTermDataByDate;
//# sourceMappingURL=shortTermUtil.js.map