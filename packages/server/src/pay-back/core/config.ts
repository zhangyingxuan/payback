// 爱问财
export const iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';

// 同花顺 数据中心/a股市场
export const marketUrl = 'http://q.10jqka.com.cn';

export const params = {
  downLimit: '跌停非st；同花顺二级行业；&querytype=stock',
  dailyLimitMoreThan1: '连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；&querytype=stock',
  dailyLimit1: '连续涨停天数%3D1；不包含新股；不包含ST&querytype=stock&issugs',
  dailyLimit2: '连续2天涨停，不包含新股，不包含ST，连续涨停天数%3D2&querytype=stock&issugs',
  // 近三日资金流向
  capitalFlows3: '近三日资金流向&querytype=stock',
  capitalFlows3Most10: '近三日资金净流入最大的10家&querytype=stock',
  // 数据中心地址
  dataCenterUrl: 'http://data.10jqka.com.cn/',
  // 找到最新 概念板块，爱问财 通过指数代码 最新代码最大
  latestConceptPlate: '%E4%B8%BB%E5%8A%9B%E8%B5%84%E9%87%91%E6%A6%82%E5%BF%B5%E6%9D%BF%E5%9D%97&querytype=zhishu',
  // 概念板块 主力资金 流入排序
  gainianFundsInflow: '概念板块主力资金；主力资金流向金额正序&querytype=zhishu',
  // 概念板块 主力资金 流出排序
  gainianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序&querytype=zhishu',
  // 行业板块 主力资金 流入排序
  hangyeFundsInflow: '行业板块主力资金流向金额正序；所属同花顺行业级别是二级行业；&querytype=zhishu',
  // 行业板块 主力资金 流出排序
  hangyeFundsOutflow: '行业板块主力资金流向金额倒序；所属同花顺行业级别是二级行业；&querytype=zhishu',
  // 概念板块 涨幅排行
  gainianRiseFloat: '概念板块主力资金；涨跌幅正序&querytype=zhishu',
  // 概念板块 跌幅排行
  gainianFallFloat: '概念板块主力资金；涨跌幅倒序&querytype=zhishu',
  // 行业板块 涨幅排行
  hangyeRiseFloat: '行业板块涨跌幅正序；所属同花顺行业级别是二级行业；&querytype=zhishu',
  // 行业板块 跌幅排行
  hangyeFallFloat: '行业板块涨跌幅倒序；所属同花顺行业级别是二级行业；&querytype=zhishu',
  // 概念板块
  gainianPlate: '概念板块&querytype=zhishu',
}