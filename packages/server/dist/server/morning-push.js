"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./src/pay-back/core/config");
const fetchUtil_1 = require("./src/pay-back/core/fetchUtil");
const transformDataUtil_1 = require("./src/pay-back/utils/transformDataUtil");
const tradeDateUtil_1 = require("./src/pay-back/utils/tradeDateUtil");
const push_service_1 = require("../push-server/src/push/push.service");
async function main() {
    const todayDateStr = (0, tradeDateUtil_1.toTradeDate)();
    const [newRs, limitUpRs] = await Promise.all([
        (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.chooseStockNewStock),
        (0, fetchUtil_1.fetchAllStocksByIwencai)(config_1.params.auctionLimitUpBySealVolume),
    ]);
    const newStocks = (0, transformDataUtil_1.transformNewStockData)(newRs.data, todayDateStr);
    const auctionLimitUp = (0, transformDataUtil_1.transformMorningAuctionLimitUpData)(limitUpRs.data, todayDateStr);
    console.log('样例:', auctionLimitUp.slice(0, 2).map((s) => `${s.name}(${String(s.code).split('.')[0]}) ${String(s.plateLevel2).split('-')[1]}`));
    const svc = new push_service_1.PushService();
    const results = await svc.pushMorningMessage({ newStocks, auctionLimitUp });
    console.log('交易日:', todayDateStr, '| 新股:', newStocks.length, '| 集合竞价涨停:', auctionLimitUp.length);
    results.forEach((r, i) => {
        console.log(`  channel ${i}: ${r.status}${r.status === 'rejected' ? ' -> ' + String(r.reason) : ''}`);
    });
}
main()
    .then(() => process.exit(0))
    .catch((e) => {
    console.error('ERR', e);
    process.exit(1);
});
//# sourceMappingURL=morning-push.js.map