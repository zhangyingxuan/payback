export const iWencaiDateFormat = 'YYYYMMDD';

export const stockBaseCondition = '非st；非退市；行业';
// export const personalPreferenceCondition = '行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST';
// 2024-06-18 17:36:19 个人偏好条件 可以做创业板，尝试绩优股
export const personalPreferenceCondition = '市盈率>0；股价低于50元；流通市值<=500亿；流通市值>=20亿；非科创板；非ST；非退市' + stockBaseCondition;

export const params = {
  downLimit: '跌停；' + stockBaseCondition,
  downLimitByDate: '${date}跌停；' + stockBaseCondition,
  // 炸板个股；涨停未遂
  dailyLimitOpen: '涨停打开；成交额；' + stockBaseCondition,
  dailyLimitOpenByDate: '${date}涨停打开；成交额；' + stockBaseCondition,
  hugeFall: '跌幅大于等于15的个股；' + stockBaseCondition,
  hugeFallByDate: '${date}跌幅大于等于15的个股；' + stockBaseCondition,
  dailyLimitMoreThan1: '涨停；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
  dailyLimitMoreThan1ByDate: '${date}涨停；几天几板；涨停原因；涨停类型；涨停开板次数；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
  // 竞价涨停
  binddingDailyLimitMoreThan1: '涨停；几天几板；涨停原因；涨停类型；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
  binddingDailyLimitMoreThan1ByDate: '${date}涨停；几天几板；涨停原因；涨停类型；封板金额；成交额；换手率；流通市值；' + stockBaseCondition,
  // 获取昨日涨停的数据（客观数据）
  dailyLimitYesterday: '昨日涨停；涨停开板次数；首次涨停时间；最终涨停时间；几天几板；昨日竞价量情况；今日竞价量情况；集合竞价评级；竞价涨幅；竞价异动类型；' + stockBaseCondition,
  // =============== =============== 选股 start  =============== ===============
  // 获取昨日涨停的数据（主观数据） 昨日涨停换手率>=5%；（去除庄股或利好一字） 防止炸板
  chooseStock1to2: '昨日首板涨停；涨停开板次数；首次涨停时间；最终涨停时间；昨日竞价量情况；今日竞价量情况；今日竞价看多；昨日涨停换手率>=5%；' + personalPreferenceCondition,
  // 首板预期个股，竞价抢筹，小幅高开 性价比高
  chooseStock1Expected: '竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；昨日未涨停；集中度70<=11；昨日收盘获利>=50%；' + personalPreferenceCondition,
  // 新股
  chooseStockNewStock: '今日新股上市；行业；竞价涨幅；流通市值；',
  // =============== =============== 选股 end  =============== ===============
  // 近三日资金流向
  capitalFlows3: '近三日资金流向降序',
  // 概念板块 主力资金 流入排序
  gainianFundsInflow: '概念板块主力资金；主力资金流向金额正序',
  // 概念板块 主力资金 流出排序
  gainianFundsOutflow: '概念板块主力资金；主力资金流向金额倒序',
  // 行业板块 主力资金 流入排序
  hangyeFundsInflow: '行业板块主力资金流向金额正序；所属同花顺行业级别是二级行业；',
  // 行业板块 主力资金 流出排序
  hangyeFundsOutflow: '行业板块主力资金流向金额倒序；所属同花顺行业级别是二级行业；',
  // 概念板块 涨幅排行
  gainianRiseFloat: '概念板块涨跌幅正序',
  // 概念板块 跌幅排行
  gainianFallFloat: '概念板块涨跌幅倒序',
  // 行业板块 涨幅排行
  hangyeRiseFloat: '行业板块涨跌幅正序；所属同花顺行业级别是二级行业；',
  // 行业板块 跌幅排行
  hangyeFallFloat: '行业板块涨跌幅倒序；所属同花顺行业级别是二级行业；',
  // 概念板块
  gainianPlate: '概念板块',
  // 行业板块，按涨停个数排序
  hangyePlateOrderByDailyLimitNum: '涨停家数>=1的行业板块；按涨停个数降序；成交额；',
  // 概念板块，按涨停个数排序
  gainianPlateOrderByDailyLimitNum: '涨停家数>=1的概念板块；按涨停个数降序；成交额；',
  // =============== ===============  个股相关 =============== =============== 
  // 2024-06-14 22:47:13
  // 容量核心
  rlCoreStock: '成交额降序；流通市值；市值；换手率',
  // 资金流入降序
  fundsInflowStock: '资金流入降序',
  // 资金流出降序
  fundsOutflowStock: '资金流出降序',
  // 区间 涨幅居前
  increaseCoreStock: '资金流入降序',
  // 区间 跌幅居前
  declineCoreStock: '资金流出降序',
}