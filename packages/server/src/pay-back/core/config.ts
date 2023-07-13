// 爱问财
export const iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';

// 同花顺 数据中心/a股市场
export const marketUrl = 'http://q.10jqka.com.cn';

export const params = {
  downLimit: '跌停；非st；同花顺二级行业',
  downLimitByDate: '${date}跌停；非st；同花顺二级行业',
  dailyLimitMoreThan1: '涨停；非ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；',
  // 炸板个股，涨停未遂
  dailyLimitOpen: '涨停打开；非ST；成交额；同花顺二级行业；',
  dailyLimitMoreThan1ByDate: '${date}涨停；非ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；',
  // 近三日资金流向
  capitalFlows3: '近三日资金流向降序',
  // 数据中心地址
  dataCenterUrl: 'http://data.10jqka.com.cn/',
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