export const columnsConfig: any = {
  7: 4,
  15: 2,
  20: 2,
  40: 1,
  60: 1,
  120: 1,
  240: 1,
};

export const iwencaiUrl = 'http://www.iwencai.com/unifiedwap/result?w=';

export const cardUrls = {
  shortTermUrl:
    iwencaiUrl +
    '连续涨停天数>%3D1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；&querytype=stock',
  iLikeUrl:
    iwencaiUrl +
    '上升趋势%20或%20横盘突破，流通市值低于80亿，股价低于20元，放量初期&querytype=stock',
  marketChartUrl: 'http://q.10jqka.com.cn/',
  fundsChartUrl: 'https://data.eastmoney.com/hsgt/index.html',
  indexChartUrl: 'http://q.10jqka.com.cn',
  hangyeFundsChartUrl:
    iwencaiUrl + '行业板块主力资金；主力资金流向金额正序&querytype=zhishu',
  gainianFundsChartUrl:
    iwencaiUrl + '概念板块主力资金；主力资金流向金额正序&querytype=zhishu',
  longhuListChartUrl:
    'https://data.10jqka.com.cn/mobile/transaction/index.html?client_userid=GJkFn&back_source=wxhy&share_hxapp=isc&fontzoom=no#/',
};