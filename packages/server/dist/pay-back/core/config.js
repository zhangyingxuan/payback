"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = exports.beizhengIndexApi = exports.chuangyeIndexApi = exports.shenzhengIndexApi = exports.shangzhengIndexApi = exports.allIndexApiFrom = exports.marketUrl = exports.iwencaiUrl = void 0;
exports.iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';
exports.marketUrl = 'http://q.10jqka.com.cn';
exports.allIndexApiFrom = 'http://d.10jqka.com.cn/v4/line/zs_1A0001/01/today.js';
exports.shangzhengIndexApi = 'http://d.10jqka.com.cn/v4/line/zs_1A0001/01/today.js';
exports.shenzhengIndexApi = 'http://d.10jqka.com.cn/v4/line/zs_399001/01/today.js';
exports.chuangyeIndexApi = 'http://d.10jqka.com.cn/v4/line/zs_399006/01/today.js';
exports.beizhengIndexApi = 'http://d.10jqka.com.cn/v4/line/151_899050/01/today.js';
exports.params = {
    downLimit: '跌停；非st；同花顺二级行业',
    downLimitByDate: '${date}跌停；非st；同花顺二级行业',
    dailyLimitOpen: '涨停打开；非ST；成交额；同花顺二级行业；',
    dailyLimitOpenByDate: '${date}涨停打开；非ST；成交额；同花顺二级行业；',
    dailyLimitMoreThan1: '涨停；非ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；',
    dailyLimitMoreThan1ByDate: '${date}涨停；非ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；',
    capitalFlows3: '近三日资金流向降序',
    dataCenterUrl: 'http://data.10jqka.com.cn/',
    gainianFundsInflow: '概念板块主力资金；主力资金流向金额正序',
    gainianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序',
    hangyeFundsInflow: '行业板块主力资金流向金额正序；所属同花顺行业级别是二级行业；',
    hangyeFundsOutflow: '行业板块主力资金流向金额倒序；所属同花顺行业级别是二级行业；',
    gainianRiseFloat: '概念板块主力资金；涨跌幅正序',
    gainianFallFloat: '概念板块主力资金；涨跌幅倒序',
    hangyeRiseFloat: '行业板块涨跌幅正序；所属同花顺行业级别是二级行业；',
    hangyeFallFloat: '行业板块涨跌幅倒序；所属同花顺行业级别是二级行业；',
    gainianPlate: '概念板块',
};
//# sourceMappingURL=config.js.map