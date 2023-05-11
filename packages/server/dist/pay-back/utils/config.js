"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = exports.marketUrl = exports.iwencaiUrl = void 0;
exports.iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result';
exports.marketUrl = 'http://q.10jqka.com.cn';
exports.params = {
    iLikeWord: '?w=上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
    downLimit: '?w=跌停非st',
    dailyLimitMoreThan1: '?w=连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额&querytype=stock',
    dailyLimit1: '?w=连续涨停天数%3D1；不包含新股；不包含ST&querytype=stock&issugs',
    dailyLimit2: '?w=连续2天涨停，不包含新股，不包含ST，连续涨停天数%3D2&querytype=stock&issugs',
    dailyLimitDetail: '?w=600636%E6%B6%A8%E5%81%9C%E6%98%8E%E7%BB%86%E6%95%B0%E6%8D%AE&querytype=stock',
    capitalFlows3: '?w=近三日资金流向&querytype=stock',
    capitalFlows3Most10: '?w=近三日资金净流入最大的10家&querytype=stock',
};
//# sourceMappingURL=config.js.map