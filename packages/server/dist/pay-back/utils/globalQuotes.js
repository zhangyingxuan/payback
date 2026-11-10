"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseGlobalQuotes = void 0;
function parseGlobalQuotes(text) {
    const names = { hkHSI: '恒生指数', hkHSTECH: '恒生科技', 'us.INX': '标普 500', 'us.IXIC': '纳斯达克' };
    return Object.entries(names).map(([code, name]) => {
        var _a;
        const line = text.split(';').find(item => item.trim().startsWith(`v_${code}=`));
        const fields = (_a = line === null || line === void 0 ? void 0 : line.split('"')[1]) === null || _a === void 0 ? void 0 : _a.split('~');
        const price = fields === null || fields === void 0 ? void 0 : fields[3];
        const change = fields === null || fields === void 0 ? void 0 : fields[32];
        return {
            code, name,
            price: price && Number.isFinite(Number(price)) ? Number(price) : null,
            change: change && Number.isFinite(Number(change)) ? Number(change) : null,
            quoteTime: (fields === null || fields === void 0 ? void 0 : fields[30]) || null,
        };
    });
}
exports.parseGlobalQuotes = parseGlobalQuotes;
//# sourceMappingURL=globalQuotes.js.map