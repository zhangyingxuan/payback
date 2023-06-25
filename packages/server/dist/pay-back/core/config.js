"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = exports.marketUrl = exports.iwencaiUrl = void 0;
exports.iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';
exports.marketUrl = 'http://q.10jqka.com.cn';
exports.params = {
    downLimit: '跌停非st；同花顺二级行业；&querytype=stock',
    dailyLimitMoreThan1: '连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；&querytype=stock',
    dailyLimit1: '连续涨停天数%3D1；不包含新股；不包含ST&querytype=stock&issugs',
    dailyLimit2: '连续2天涨停，不包含新股，不包含ST，连续涨停天数%3D2&querytype=stock&issugs',
    capitalFlows3: '近三日资金流向&querytype=stock',
    capitalFlows3Most10: '近三日资金净流入最大的10家&querytype=stock',
    dataCenterUrl: 'http://data.10jqka.com.cn/',
    latestConceptPlate: '%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%E6%A6%82%E5%BF%B5%E6%9D%BF%E5%9D%97&querytype=zhishu',
    gainianFundsInflow: '概念板块主力资金；主力资金流向金额正序&querytype=zhishu',
    gainianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序&querytype=zhishu',
    hangyeFundsInflow: '行业板块主力资金流向金额正序；所属同花顺行业级别是二级行业；&querytype=zhishu',
    hangyeFundsOutflow: '行业板块主力资金流向金额倒序；所属同花顺行业级别是二级行业；&querytype=zhishu',
    gainianRiseFloat: '概念板块主力资金；涨跌幅正序&querytype=zhishu',
    gainianFallFloat: '概念板块主力资金；涨跌幅倒序&querytype=zhishu',
    hangyeRiseFloat: '行业板块涨跌幅正序；所属同花顺行业级别是二级行业；&querytype=zhishu',
    hangyeFallFloat: '行业板块涨跌幅倒序；所属同花顺行业级别是二级行业；&querytype=zhishu',
    gainianPlate: '概念板块&querytype=zhishu',
};
//# sourceMappingURL=config.js.map