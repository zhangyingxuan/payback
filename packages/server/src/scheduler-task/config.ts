// 新闻推送定时任务
// const newsPushSchedulerTask = {
//   taskName: 'autoCrawlNewsTask',
//   service: 'thsService',
//   func: 'fetchNewsTask',
//   cron: '*/10 * 7-23 * * *',
// };
const newsPushSchedulerTask = {
  taskName: 'autoCrawlNewsTask',
  service: 'pushServer',
  func: 'fetchNewsTask',
  cron: '*/10 * 7-23 * * *',
};

// 定时任务列表
const schedulerTaskList = [
  // 资金相关 === start
  {
    taskName: 'autoCrawlfundsDataLateSession',
    service: 'fundsService',
    func: 'crawlfundsData',
    cron: '0 10 16 * * 1-5',
  },
  {
    // 更新北向资金
    taskName: 'autoCrawlnorthDataLateSession',
    service: 'fundsService',
    func: 'crawlfundsData',
    cron: '0 10 18 * * 1-5',
  },
  {
    taskName: 'autoCrawlfundsDataMidday',
    service: 'fundsService',
    func: 'crawlfundsData',
    cron: '0 41 11 * * 1-5',
  },
  // 资金相关 === end
  // 热榜相关 === start
  {
    // 尾盘 获取资金数据
    taskName: 'autoCrawlHotListData',
    service: 'hotListService',
    func: 'crawlHotListData',
    cron: '0 */30 7-23 * * *',
  },
  // 热榜相关 === end
  // 最新概念 === start
  {
    taskName: 'autoCrawlLatestConceptPlateDataAm',
    service: 'latestConceptPlateService',
    func: 'crawlLatestConceptPlateData',
    cron: '0 05 9 * * 1-5',
  },
  {
    taskName: 'autoCrawlLatestConceptPlateDataPm',
    service: 'latestConceptPlateService',
    func: 'crawlLatestConceptPlateData',
    cron: '0 00 16 * * 1-5',
  },
  {
    taskName: 'autoCrawlLatestConceptPlateDataEvening',
    service: 'latestConceptPlateService',
    func: 'crawlLatestConceptPlateData',
    cron: '0 00 23 * * 1-5',
  },
  // 最新概念 === end
  // 市场数据 === start
  {
    taskName: 'autoCrawlMarketDataMidday',
    service: 'marketService',
    func: 'crawlMarketData',
    cron: '0 31 11 * * 1-5',
  },
  {
    taskName: 'autoCrawlMarketDataPm',
    service: 'marketService',
    func: 'crawlMarketData',
    cron: '0 10 15 * * 1-5',
  },
  // 市场数据 === end
  // 板块数据 === start
  {
    taskName: 'autoCrawlPlateDataMidday',
    service: 'plateService',
    func: 'crawlPlateData',
    cron: '0 33 11 * * 1-5',
  },
  {
    taskName: 'autoCrawlPlateDataLatePm',
    service: 'plateService',
    func: 'crawlPlateData',
    cron: '0 15 15 * * 1-5',
  },
  // 板块数据 === end
  // 短线数据 === start
  {
    taskName: 'autoCrawlShortTermDataMidday',
    service: 'shorTermService',
    func: 'crawlShortTermData',
    cron: '0 36 11 * * 1-5',
  },
  {
    taskName: 'autoCrawlShortTermDataLatePm',
    service: 'shorTermService',
    func: 'crawlShortTermData',
    cron: '0 20 15 * * 1-5',
  },
  // 短线数据 === end
  // 竞价数据&新股&强势股 === start
  {
    taskName: 'autoCrawlBinddingDataMidday',
    service: 'specialStockService',
    func: 'crawlBinddingData',
    cron: '00 38 11 * * 1-5',
  },
  {
    taskName: 'autoCrawlBinddingDataLatePm',
    service: 'specialStockService',
    func: 'crawlBinddingData',
    cron: '00 05 15 * * 1-5',
  },
  // 竞价数据&新股&强势股 === end
];
export { schedulerTaskList, newsPushSchedulerTask };
