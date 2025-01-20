"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsService = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const fetchUtil_1 = require("./utils/fetchUtil");
let NewsService = NewsService_1 = class NewsService {
    constructor() {
        this.latestTime = Math.round(new Date().getTime() / 1000).toString();
        this.tempLatestTime = '';
        this.logger = new common_2.Logger(NewsService_1.name);
    }
    async fetchNews(latestTime, signal) {
        var _a;
        let result = { data: { list: [] } };
        latestTime = latestTime
            ? latestTime
            : Math.round(new Date().getTime() / 1000).toString();
        try {
            result = await (0, fetchUtil_1.fetchNewsRequest)(latestTime, signal);
        }
        catch (error) {
            this.logger.error('[fetchNews] 获取新闻数据失败：' + error);
            return [];
        }
        return (_a = result === null || result === void 0 ? void 0 : result.data) === null || _a === void 0 ? void 0 : _a.list;
    }
    importantNewsFilter(list, latestTime) {
        const needPushNews = [];
        list &&
            list.forEach((news, i) => {
                if (i === 0) {
                    latestTime = news.ctime;
                }
                if (news.color === '2') {
                    this.logger.log('color2 A股====' + news.title);
                    needPushNews.push(news);
                }
            });
        return { newsList: needPushNews, latestTime };
    }
    async fetchNewsTask(signal) {
        this.tempLatestTime = this.latestTime;
        const list = await this.fetchNews(this.latestTime, signal);
        this.logger.log('[fetchNewsTask] 获取所有新闻: ' +
            this.latestTime +
            '，条数：' +
            (list === null || list === void 0 ? void 0 : list.length));
        const newsData = this.importantNewsFilter(list, this.latestTime);
        this.latestTime = newsData.latestTime;
        return newsData.newsList;
    }
    async fetchLatestNews(latestTime) {
        const list = await this.fetchNews(latestTime, null);
        this.logger.log('[fetchLatestNews] 获取所有新闻: ' +
            latestTime +
            '，条数：' +
            (list === null || list === void 0 ? void 0 : list.length));
        return this.importantNewsFilter(list, latestTime);
    }
    reductionLatestTime() {
        this.latestTime = this.tempLatestTime;
        this.tempLatestTime = '';
    }
};
NewsService = NewsService_1 = __decorate([
    (0, common_1.Injectable)()
], NewsService);
exports.NewsService = NewsService;
//# sourceMappingURL=news.service.js.map