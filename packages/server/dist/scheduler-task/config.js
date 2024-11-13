"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newsPushSchedulerTask = exports.schedulerTaskList = void 0;
const newsPushSchedulerTask = {
    taskName: 'autoCrawlNewsTask',
    service: 'pushServer',
    func: 'fetchNewsTask',
    cron: '*/2 * 7-23 * * *',
};
exports.newsPushSchedulerTask = newsPushSchedulerTask;
const schedulerTaskList = [
    {
        taskName: 'autoCrawlfundsDataLateSession',
        service: 'fundsService',
        func: 'crawlfundsData',
        cron: '0 10 16 * * 1-5',
    },
    {
        taskName: 'autoCrawlfundsDataMidday',
        service: 'fundsService',
        func: 'crawlfundsData',
        cron: '0 41 11 * * 1-5',
    },
    {
        taskName: 'autoCrawlHotListData',
        service: 'hotListService',
        func: 'crawlHotListData',
        cron: '0 */30 7-23 * * *',
    },
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
        cron: '0 40 15 * * 1-5',
    },
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
        cron: '0 35 15 * * 1-5',
    },
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
        cron: '00 33 15 * * 1-5',
    },
];
exports.schedulerTaskList = schedulerTaskList;
//# sourceMappingURL=config.js.map