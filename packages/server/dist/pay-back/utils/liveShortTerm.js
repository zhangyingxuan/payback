"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLiveShortTerm = void 0;
function buildLiveShortTerm(stocks, boards, blocks, counts) {
    var _a, _b, _c;
    const levels = new Map();
    boards.forEach(group => {
        if (Number(group.height) > 1 && Array.isArray(group.code_list)) {
            group.code_list.forEach(stock => levels.set(stock.code, Number(group.height)));
        }
    });
    const details = new Map();
    blocks.forEach(block => (block.stock_list || []).forEach(stock => {
        if (!details.has(stock.code))
            details.set(stock.code, Object.assign(Object.assign({}, stock), { blockName: block.name }));
    }));
    const evenBoardData = {};
    stocks.forEach(stock => {
        const level = levels.get(stock.code) || 1;
        const detail = details.get(stock.code);
        const timestamp = Number(detail === null || detail === void 0 ? void 0 : detail.first_limit_up_time);
        const dailyTime = timestamp > 0 ? new Date(timestamp * 1000).toLocaleTimeString('zh-CN', {
            timeZone: 'Asia/Shanghai', hour12: false,
        }) : undefined;
        const group = (evenBoardData[level] || (evenBoardData[level] = []));
        group.push({ code: stock.code, name: stock.name, plateLevel2: detail === null || detail === void 0 ? void 0 : detail.blockName, reason: detail === null || detail === void 0 ? void 0 : detail.reason_type, dailyTime });
    });
    const heights = stocks.map(stock => levels.get(stock.code) || 1);
    return {
        dailyLimitQuantity: stocks.length,
        downLimitQuantity: (_b = (_a = counts === null || counts === void 0 ? void 0 : counts.limitDown) === null || _a === void 0 ? void 0 : _a.num) !== null && _b !== void 0 ? _b : null,
        sealingRate: ((_c = counts === null || counts === void 0 ? void 0 : counts.limitUp) === null || _c === void 0 ? void 0 : _c.rate) == null ? null : counts.limitUp.rate * 100,
        dailyLimitReturnSealQuantity: stocks.filter(stock => Number(stock.is_again_limit) === 1).length,
        evenBoardAmount: heights.filter(height => height > 1).length,
        marketHeight: heights.length ? Math.max(...heights) : null,
        evenBoardData: JSON.stringify(evenBoardData),
        createTime: new Date(),
    };
}
exports.buildLiveShortTerm = buildLiveShortTerm;
//# sourceMappingURL=liveShortTerm.js.map