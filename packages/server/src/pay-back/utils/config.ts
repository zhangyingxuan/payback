// 爱问财
export const iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result';
// 同花顺 数据中心/a股市场
export const marketUrl = 'http://q.10jqka.com.cn';

export const params = {
  // 我最喜欢的股票的关键字
  iLikeWord: '?w=上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
  // iLikeWord: '?w=箱体突破或横盘突破，流通市值低于80亿大于10亿，股价低于20元，放量初期&querytype=stock',
  // downLimit: '?w=跌停',
  downLimit: '?w=跌停非st',
  // dailyLimitMoreThan1: '?w=连续涨停天数>%3D1；不包含新股；不包含ST&querytype=stock&issugs',
  dailyLimitMoreThan1: '?w=连续涨停天数>%3D1；不包含新股；不包含ST；涨停原因；封板金额&querytype=stock',
  dailyLimit1: '?w=连续涨停天数%3D1；不包含新股；不包含ST&querytype=stock&issugs',
  dailyLimit2: '?w=连续2天涨停，不包含新股，不包含ST，连续涨停天数%3D2&querytype=stock&issugs',
  // 近三日资金流向
  capitalFlows3: '?w=近三日资金流向&querytype=stock',
  capitalFlows3Most10: '?w=近三日资金净流入最大的10家&querytype=stock',
  // 市场变化：成交量 变化、风格
  // 资金青睐：资金净流入最大的3家
  // 人气：高度最高、人气最高题材、
  // 新：新板块
  // 1、找出出手时机， 阶段1
  // 2、找到板块，阶段2
  // 3、标的 及 目标买卖点
}