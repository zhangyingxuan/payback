declare const newsPushSchedulerTask: {
    taskName: string;
    service: string;
    func: string;
    cron: string;
    tradingDaysOnly: boolean;
};
declare const schedulerTaskList: ({
    taskName: string;
    service: string;
    func: string;
    cron: string;
    tradingDaysOnly: boolean;
} | {
    taskName: string;
    service: string;
    func: string;
    cron: string;
    tradingDaysOnly?: undefined;
})[];
export { schedulerTaskList, newsPushSchedulerTask };
