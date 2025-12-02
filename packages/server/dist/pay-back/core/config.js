"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beizhengIndexApi = exports.chuangyeIndexApi = exports.shenzhengIndexApi = exports.shangzhengIndexApi = exports.allIndexApiFrom = exports.marketUrl = exports.iwencaiUrl = exports.params = exports.chooseStockBaseCondition = void 0;
const pay_back_core_1 = require("pay-back-core");
exports.chooseStockBaseCondition = pay_back_core_1.chooseStockBaseCondition;
exports.params = pay_back_core_1.params;
exports.iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';
exports.marketUrl = 'http://q.10jqka.com.cn';
exports.allIndexApiFrom = 'http://d.10jqka.com.cn/v4/line/zs_1A0001/01/today.js';
exports.shangzhengIndexApi = 'http://d.10jqka.com.cn/v4/line/zs_1A0001/01/today.js';
exports.shenzhengIndexApi = 'http://d.10jqka.com.cn/v4/line/zs_399001/01/today.js';
exports.chuangyeIndexApi = 'http://d.10jqka.com.cn/v4/line/zs_399006/01/today.js';
exports.beizhengIndexApi = 'http://d.10jqka.com.cn/v4/line/151_899050/01/today.js';
//# sourceMappingURL=config.js.map