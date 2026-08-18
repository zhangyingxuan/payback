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
var FeishuRobotService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeishuRobotService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const node_fetch_1 = require("node-fetch");
const crypto_1 = require("crypto");
const dayjs = require("dayjs");
let FeishuRobotService = FeishuRobotService_1 = class FeishuRobotService {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(FeishuRobotService_1.name);
        this.webhookUrls = this.parseList(this.config.get('FEISHU_WEBHOOK_URLS'));
        this.signingSecrets = this.parseList(this.config.get('FEISHU_SIGNING_SECRETS'));
    }
    isEnabled() {
        return this.webhookUrls.length > 0;
    }
    async notice(serviceName, msgContent) {
        const content = [
            `**服务：** ${serviceName}`,
            `**环境：** ${this.config.get('NODE_ENV') || 'unknown'}`,
            `**时间：** ${dayjs().format('YYYY-MM-DD HH:mm:ss')}`,
            '',
            msgContent,
        ].join('\n');
        return this.pushCard('服务告警', content, 'red');
    }
    async noticeNews(newsTitle, msgContent, newsUrl, news) {
        const content = [
            (news === null || news === void 0 ? void 0 : news.tag) ? `**标签：** ${news.tag}` : '',
            `**${newsTitle}**`,
            msgContent,
            this.prepareStocks(news),
            `**时间：** ${this.getNewsTime(news)}`,
        ]
            .filter(Boolean)
            .join('\n\n');
        return this.pushCard((news === null || news === void 0 ? void 0 : news.tag) ? `【${news.tag}】${newsTitle}` : newsTitle, content, 'blue', newsUrl);
    }
    prepareStocks(news) {
        if (!(news === null || news === void 0 ? void 0 : news.tag) || (!news.tag.includes('A股') && !news.tag.includes('异动'))) {
            return '';
        }
        const fields = (news.field || []).map(item => `[${item.name}(${item.stockCode})](http://q.10jqka.com.cn/thshy/detail/code/${item.stockCode})`);
        const stocks = (news.stock || []).map(item => `[${item.name}(${item.stockCode})](https://stockpage.10jqka.com.cn/${item.stockCode}/)`);
        return [...fields, ...stocks].join(' ');
    }
    getNewsTime(news) {
        const timestamp = Number(news === null || news === void 0 ? void 0 : news.ctime);
        return timestamp ? dayjs(timestamp * 1000).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    async pushCard(title, content, template, url) {
        if (!this.isEnabled()) {
            return [];
        }
        const elements = [
            {
                tag: 'div',
                text: { tag: 'lark_md', content },
            },
        ];
        if (url) {
            elements.push({
                tag: 'action',
                actions: [
                    {
                        tag: 'button',
                        text: { tag: 'plain_text', content: '查看详情' },
                        type: 'primary',
                        url,
                    },
                ],
            });
        }
        const card = {
            msg_type: 'interactive',
            card: {
                config: { wide_screen_mode: true },
                header: {
                    template,
                    title: { tag: 'plain_text', content: title.substring(0, 100) },
                },
                elements,
            },
        };
        return Promise.allSettled(this.webhookUrls.map((webhookUrl, index) => this.send(webhookUrl, this.signingSecrets[index], card)));
    }
    async send(webhookUrl, secret, card) {
        const body = secret ? Object.assign(Object.assign({}, card), this.createSignature(secret)) : card;
        const response = await (0, node_fetch_1.default)(webhookUrl, {
            headers: { 'content-type': 'application/json; charset=utf-8' },
            body: JSON.stringify(body),
            method: 'POST',
        });
        const result = await response.json();
        if (!response.ok || (result.code !== undefined && result.code !== 0)) {
            const error = new Error(`飞书机器人推送失败: HTTP ${response.status}, code=${result.code}, msg=${result.msg || ''}`);
            this.logger.error(error.message);
            throw error;
        }
        return result;
    }
    createSignature(secret) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const stringToSign = `${timestamp}\n${secret}`;
        const sign = (0, crypto_1.createHmac)('sha256', stringToSign).update('').digest('base64');
        return { timestamp, sign };
    }
    parseList(value) {
        return (value || '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
    }
};
FeishuRobotService = FeishuRobotService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FeishuRobotService);
exports.FeishuRobotService = FeishuRobotService;
//# sourceMappingURL=feishu-robot.service.js.map