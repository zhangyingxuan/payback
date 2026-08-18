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
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const node_fetch_1 = require("node-fetch");
const dayjs = require("dayjs");
const feishu_robot_service_1 = require("./feishu-robot.service");
const thsPlateBaseUrl = 'http://q.10jqka.com.cn/thshy/detail/code/';
const thsStockBaseUrl = 'https://stockpage.10jqka.com.cn/';
let PushService = PushService_1 = class PushService {
    constructor(feishuRobotService) {
        this.feishuRobotService = feishuRobotService;
        this.logger = new common_1.Logger(PushService_1.name);
        this.robotList = [
            'ddbae7ea-7496-4cd8-97c5-c0b195d9609b',
            '474f2a05-c848-4049-b7f0-90630374a408',
        ];
    }
    async notice(serviceName, msgContent = '哎哟，不错哦') {
        const todayDateStr = new Date();
        const content = [];
        content.push(`**【服务告警】**`);
        content.push(` <font color=\"red\">**${serviceName}**</font>`);
        content.push(` <font color=\"warning\">${process.env.NODE_ENV}</font>`);
        content.push(` <font color=\"comment\">${dayjs(todayDateStr).format('HH:mm:ss')}</font>\n`);
        content.push(`> <font color=\"comment\">${msgContent}</font>`);
        const body = {
            msgtype: 'markdown',
            markdown: {
                content: content.join(''),
            },
        };
        const results = await Promise.allSettled([
            this.pushMsg2Robot(body),
            this.feishuRobotService.notice(serviceName, msgContent),
        ]);
        this.logRejectedChannels(results);
        return results;
    }
    prepareTagContent(tags, baseUrl) {
        const tagContent = [];
        tags.forEach((tag) => {
            tagContent.push(`[${tag.name}(${tag.stockCode})](${baseUrl + tag.stockCode}) `);
        });
        return tagContent.join('');
    }
    prepareMsgWord(newsTitle) {
        newsTitle = newsTitle.replace('涨', '<font color="#ff0000">涨</font>');
        newsTitle = newsTitle.replace('跌', '<font color="#2db688">跌</font>');
        return newsTitle;
    }
    async noticeNews(newsTitle, msgContent = '哎哟，不错哦', newsUrl, news) {
        var _a, _b;
        const content = [];
        content.push(`**【${news === null || news === void 0 ? void 0 : news.tag}】**`);
        content.push(` [<font color=\"#3858e6\">**${this.prepareMsgWord(newsTitle)}**</font>](${newsUrl})`);
        content.push(` <font color=\"comment\">${dayjs(new Date(+news.ctime * 1000)).format('HH:mm:ss')}</font>\n`);
        content.push(`> <font color=\"comment\">${msgContent}</font>\n\n`);
        if (news.tag && (news.tag.includes('A股') || news.tag.includes('异动'))) {
            if (((_a = news === null || news === void 0 ? void 0 : news.field) === null || _a === void 0 ? void 0 : _a.length) > 0) {
                content.push(this.prepareTagContent(news === null || news === void 0 ? void 0 : news.field, thsPlateBaseUrl));
            }
            if (((_b = news === null || news === void 0 ? void 0 : news.stock) === null || _b === void 0 ? void 0 : _b.length) > 0) {
                content.push(this.prepareTagContent(news === null || news === void 0 ? void 0 : news.stock, thsStockBaseUrl));
            }
        }
        const body = {
            msgtype: 'markdown',
            markdown: {
                content: content.join(''),
            },
        };
        const results = await Promise.allSettled([
            this.pushMsg2Robot(body),
            this.feishuRobotService.noticeNews(newsTitle, msgContent, newsUrl, news),
        ]);
        this.logRejectedChannels(results);
        return results;
    }
    pushMsg2Robot(body) {
        return Promise.allSettled(this.robotList.map((robotKey) => this.qyapi(robotKey, body)));
    }
    logRejectedChannels(results) {
        results.forEach((result) => {
            if (result.status === 'rejected') {
                this.logger.error(result.reason);
            }
        });
    }
    async qyapi(robotKey, body) {
        try {
            const response = await (0, node_fetch_1.default)(`https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${robotKey}`, {
                headers: {
                    accept: 'application/json, text/plain, */*',
                    'accept-language': 'zh-CN,zh;q=0.9',
                    'cache-control': 'no-cache',
                    'content-type': 'application/json',
                    pragma: 'no-cache',
                },
                body: JSON.stringify(body),
                referrerPolicy: 'strict-origin-when-cross-origin',
                method: 'POST',
                mode: 'cors',
                credentials: 'include',
            });
            return await response.json();
        }
        catch (e) {
            this.logger.error(e);
            throw e;
        }
    }
};
PushService = PushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [feishu_robot_service_1.FeishuRobotService])
], PushService);
exports.PushService = PushService;
//# sourceMappingURL=push.service.js.map