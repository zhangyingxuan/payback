declare const newsPushSchedulerTask: {
    taskName: string;
    service: string;
    func: string;
    cron: string;
};
declare const schedulerTaskList: {
    taskName: string;
    service: string;
    func: string;
    cron: string;
}[];
export { schedulerTaskList, newsPushSchedulerTask };
