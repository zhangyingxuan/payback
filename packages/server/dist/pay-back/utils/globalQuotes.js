"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAsiaQuotes = exports.parseGlobalQuotes = void 0;
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
function parseAsiaQuotes(rows) {
    const names = { KS11: '韩国 KOSPI', N225: '日经 225' };
    return Object.entries(names).map(([code, name]) => {
        const row = rows.find(item => item.f12 === code);
        const stamp = row === null || row === void 0 ? void 0 : row.f124;
        return {
            code, name,
            price: typeof (row === null || row === void 0 ? void 0 : row.f2) === 'number' && Number.isFinite(row.f2) ? row.f2 : null,
            change: typeof (row === null || row === void 0 ? void 0 : row.f3) === 'number' && Number.isFinite(row.f3) ? row.f3 : null,
            quoteTime: typeof stamp === 'number' && Number.isFinite(stamp) && stamp > 0 && Number.isFinite(new Date(stamp * 1000).getTime())
                ? new Date(stamp * 1000).toLocaleString('sv-SE', { timeZone: 'Asia/Tokyo' }).replace(/-/g, '/') : null,
        };
    });
}
exports.parseAsiaQuotes = parseAsiaQuotes;
//# sourceMappingURL=globalQuotes.js.map