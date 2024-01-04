export const iWencaiDateFormat = 'YYYYMMDD';

export const chooseStockBaseCondition = '行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST';

export const params = {
  downLimit: '跌停；非st；行业',
  downLimitByDate: '${date}跌停；非st；行业',
  // 炸板个股；涨停未遂
  dailyLimitOpen: '涨停打开；非ST；成交额；行业',
  dailyLimitOpenByDate: '${date}涨停打开；非ST；成交额；行业',
  hugeFall: '跌幅大于等于15的个股；行业',
  hugeFallByDate: '${date}跌幅大于等于15的个股；行业',
  dailyLimitMoreThan1: '涨停；非ST；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；行业',
  dailyLimitMoreThan1ByDate: '${date}涨停；非ST；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；行业',
  // 获取昨日涨停的数据（客观数据）
  dailyLimitYesterday: '昨日涨停；涨停开板次数；首次涨停时间；最终涨停时间；几天几板；昨日竞价量情况；今日竞价量情况；集合竞价评级；竞价涨幅；竞价异动类型；非ST；行业',
  // =============== =============== 选股 start  =============== ===============
  // 获取昨日涨停的数据（主观数据） 昨日涨停换手率>=5%；（去除庄股或利好一字） 防止炸板
  chooseStock1to2: '昨日首板涨停；涨停开板次数；首次涨停时间；最终涨停时间；昨日竞价量情况；今日竞价量情况；今日竞价看多；昨日涨停换手率>=5%；' + chooseStockBaseCondition,
  // 首板预期个股，竞价抢筹，小幅高开 性价比高
  chooseStock1Expected: '竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；昨日未涨停；集中度70<=11；昨日收盘获利>=50%；' + chooseStockBaseCondition,
  // 新股
  chooseStockNewStock: '今日新股上市；行业；竞价涨幅；流通市值；',
  // =============== =============== 选股 end  =============== ===============

  // 近三日资金流向
  capitalFlows3: '近三日资金流向降序',
  // 数据中心地址
  dataCenterUrl: 'http://data.10jqka.com.cn/',
  // 概念板块 主力资金 流入排序
  gainianFundsInflow: '概念板块主力资金；主力资金流向金额正序',
  // 概念板块 主力资金 流出排序
  gainianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序',
  // 行业板块 主力资金 流入排序
  hangyeFundsInflow: '行业板块主力资金流向金额正序；所属同花顺行业级别是二级行业；',
  // 行业板块 主力资金 流出排序
  hangyeFundsOutflow: '行业板块主力资金流向金额倒序；所属同花顺行业级别是二级行业；',
  // 概念板块 涨幅排行
  gainianRiseFloat: '概念板块主力资金；涨跌幅正序',
  // 概念板块 跌幅排行
  gainianFallFloat: '概念板块主力资金；涨跌幅倒序',
  // 行业板块 涨幅排行
  hangyeRiseFloat: '行业板块涨跌幅正序；所属同花顺行业级别是二级行业；',
  // 行业板块 跌幅排行
  hangyeFallFloat: '行业板块涨跌幅倒序；所属同花顺行业级别是二级行业；',
  // 概念板块
  gainianPlate: '概念板块',
}