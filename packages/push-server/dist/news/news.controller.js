"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NewsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewsController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const common_2 = require("@nestjs/common");
const news_service_1 = require("./news.service");
const push_service_1 = require("../push/push.service");
let NewsController = NewsController_1 = class NewsController {
    constructor(newsService, pushService) {
        this.newsService = newsService;
        this.pushService = pushService;
        this.logger = new common_2.Logger(NewsController_1.name);
    }
    async fetchNewsTask() {
        const newsArr = await this.newsService.fetchNews();
        newsArr.forEach((news) => {
            try {
                this.pushService.noticeNews(news.title, news.digest, news.url, news);
            }
            catch (e) {
                this.logger.log('[fetchNewsTask] 推送消息失败：' + e);
                this.newsService.reductionLatestTime();
            }
        });
    }
};
__decorate([
    (0, microservices_1.MessagePattern)('fetchNewsTask'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NewsController.prototype, "fetchNewsTask", null);
NewsController = NewsController_1 = __decorate([
    (0, common_1.Controller)('news'),
    __metadata("design:paramtypes", [news_service_1.NewsService,
        push_service_1.PushService])
], NewsController);
exports.NewsController = NewsController;
//# sourceMappingURL=news.controller.js.map