"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIwencaiDate = exports.toTradeDate = void 0;
const dayjs = require("dayjs");
const toTradeDate = (value = new Date()) => dayjs(value).format('YYYY-MM-DD');
exports.toTradeDate = toTradeDate;
const toIwencaiDate = (value = new Date()) => dayjs(value).format('YYYYMMDD');
exports.toIwencaiDate = toIwencaiDate;
//# sourceMappingURL=tradeDateUtil.js.map