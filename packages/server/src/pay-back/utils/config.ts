// 爱问财
export const iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';

// 同花顺 数据中心/a股市场
export const marketUrl = 'http://q.10jqka.com.cn';

export const params = {
  // 我最喜欢的股票的关键字
  iLikeWord: '上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
  // iLikeWord: '箱体突破或横盘突破，流通市值低于80亿大于10亿，股价低于20元，放量初期&querytype=stock',
  // downLimit: '跌停',
  downLimit: '跌停非st',
  // dailyLimitMoreThan1: '连续涨停天数>%3D1；不包含新股；不包含ST&querytype=stock&issugs',
  dailyLimitMoreThan1: '连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额&querytype=stock',
  dailyLimit1: '连续涨停天数%3D1；不包含新股；不包含ST&querytype=stock&issugs',
  dailyLimit2: '连续2天涨停，不包含新股，不包含ST，连续涨停天数%3D2&querytype=stock&issugs',
  // 涨停明细数据，代码 + 涨停明细数据
  dailyLimitDetail: '600636%E6%B6%A8%E5%81%9C%E6%98%8E%E7%BB%86%E6%95%B0%E6%8D%AE&querytype=stock',
  // 近三日资金流向
  capitalFlows3: '近三日资金流向&querytype=stock',
  capitalFlows3Most10: '近三日资金净流入最大的10家&querytype=stock',
  // 市场变化：成交量 变化、风格
  // 资金青睐：资金净流入最大的3家
  // 人气：高度最高、人气最高题材、
  // 新：新板块
  // 1、找出出手时机， 阶段1
  // 2、找到板块，阶段2
  // 3、标的 及 目标买卖点
  // 数据中心地址
  dataCenterUrl: 'http://data.10jqka.com.cn/',
  // 找到最新 概念板块，爱问财 通过指数代码 最新代码最大
  latestConceptPlate: '%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%E6%A6%82%E5%BF%B5%E6%9D%BF%E5%9D%97&querytype=zhishu',
  // 概念板块 主力资金 流入排序
  gailianFundsInflow: '概念板块主力资金；主力资金流向金额正序&querytype=zhishu',
  // 概念板块 主力资金 流出排序
  gailianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序&querytype=zhishu',
  // 概念板块 主力资金 流入排序
  hangyeFundsInflow: '行业板块主力资金；主力资金流向金额正序&querytype=zhishu',
  // 概念板块 主力资金 流出排序
  hangyeFundsOutflow: '行业板块主力资金；主力资金流向金额倒序&querytype=zhishu',
}