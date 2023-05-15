"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = exports.marketUrl = exports.iwencaiUrl = void 0;
exports.iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';
exports.marketUrl = 'http://q.10jqka.com.cn';
exports.params = {
    iLikeWord: '上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
    downLimit: '跌停非st',
    dailyLimitMoreThan1: '连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额&querytype=stock',
    dailyLimit1: '连续涨停天数%3D1；不包含新股；不包含ST&querytype=stock&issugs',
    dailyLimit2: '连续2天涨停，不包含新股，不包含ST，连续涨停天数%3D2&querytype=stock&issugs',
    dailyLimitDetail: '600636%E6%B6%A8%E5%81%9C%E6%98%8E%E7%BB%86%E6%95%B0%E6%8D%AE&querytype=stock',
    capitalFlows3: '近三日资金流向&querytype=stock',
    capitalFlows3Most10: '近三日资金净流入最大的10家&querytype=stock',
    dataCenterUrl: 'http://data.10jqka.com.cn/',
    latestConceptPlate: '%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%E6%A6%82%E5%BF%B5%E6%9D%BF%E5%9D%97&querytype=zhishu',
    gailianFundsInflow: '概念板块主力资金；主力资金流向金额正序&querytype=zhishu',
    gailianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序&querytype=zhishu',
    hangyeFundsInflow: '行业板块主力资金；主力资金流向金额正序&querytype=zhishu',
    hangyeFundsOutflow: '行业板块主力资金；主力资金流向金额倒序&querytype=zhishu',
};
//# sourceMappingURL=config.js.map