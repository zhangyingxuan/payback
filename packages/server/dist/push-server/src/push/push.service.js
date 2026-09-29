"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var PushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushService = void 0;
const common_1 = require("@nestjs/common");
const node_fetch_1 = require("node-fetch");
const dayjs = require("dayjs");
const crypto_1 = require("crypto");
const thsPlateBaseUrl = 'http://q.10jqka.com.cn/thshy/detail/code/';
const thsStockBaseUrl = 'https://stockpage.10jqka.com.cn/';
const feishuWebhookUrls = [
    'https://open.feishu.cn/open-apis/bot/v2/hook/d3876526-1889-44de-a2fc-3df92f1c0442',
];
const feishuSigningSecrets = [];
let PushService = PushService_1 = class PushService {
    constructor() {
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
        const markdownContent = content.join('');
        const body = {
            msgtype: 'markdown',
            markdown: {
                content: markdownContent,
            },
        };
        const results = await Promise.allSettled([
            this.pushMsg2Robot(body),
            this.pushFeishuMarkdown(markdownContent),
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
        const markdownContent = content.join('');
        const body = {
            msgtype: 'markdown',
            markdown: {
                content: markdownContent,
            },
        };
        const results = await Promise.allSettled([
            this.pushMsg2Robot(body),
            this.pushFeishuMarkdown(markdownContent),
        ]);
        this.logRejectedChannels(results);
        return results;
    }
    async pushMorningMessage(payload) {
        const todayDateStr = dayjs().format('YYYY-MM-DD');
        const { newStocks = [], auctionLimitUp = [] } = payload || {};
        const formatSeal = (item) => `${((item.sealQuantity || 0) / 1e8).toFixed(2)}亿`;
        const code6 = (item) => String(item.code || '').split('.')[0];
        const plate2 = (item) => String(item.plateLevel2 || '').split('-')[1] || item.plateLevel2 || '';
        const stockLine = (item, index, showSeal) => {
            const code = code6(item);
            const seal = showSeal ? ` ｜ 封单 <font color="red">${formatSeal(item)}</font>` : '';
            return `${index + 1}. [${item.name}](${thsStockBaseUrl + code})(${code})${seal} ${plate2(item)}`;
        };
        const elements = [];
        elements.push({
            tag: 'div',
            text: { tag: 'lark_md', content: `**集合竞价涨停（${auctionLimitUp.length}，按封单量）**` },
        });
        if (auctionLimitUp.length > 0) {
            auctionLimitUp.slice(0, 20).forEach((item, index) => {
                elements.push({ tag: 'div', text: { tag: 'lark_md', content: stockLine(item, index, true) } });
            });
        }
        else {
            elements.push({ tag: 'div', text: { tag: 'lark_md', content: '> 无' } });
        }
        elements.push({ tag: 'hr' });
        elements.push({
            tag: 'div',
            text: { tag: 'lark_md', content: `**今日上市新股（${newStocks.length}）**` },
        });
        if (newStocks.length > 0) {
            newStocks.forEach((item, index) => {
                elements.push({ tag: 'div', text: { tag: 'lark_md', content: stockLine(item, index, false) } });
            });
        }
        else {
            elements.push({ tag: 'div', text: { tag: 'lark_md', content: '> 无' } });
        }
        const card = {
            msg_type: 'interactive',
            card: {
                config: { wide_screen_mode: true },
                header: {
                    title: { tag: 'plain_text', content: `早盘 集合竞价 ${todayDateStr}` },
                    template: 'blue',
                },
                elements,
            },
        };
        const content = [];
        content.push(`**【早盘 集合竞价】** ${todayDateStr}\n`);
        content.push(`**集合竞价涨停（${auctionLimitUp.length}，按封单量）**\n`);
        if (auctionLimitUp.length > 0) {
            auctionLimitUp.slice(0, 20).forEach((item, index) => {
                content.push(`${index + 1}. ${item.name}(${code6(item)}) 封单 ${formatSeal(item)} ${plate2(item)}\n`);
            });
        }
        else {
            content.push(`> 无\n`);
        }
        content.push(`**今日上市新股（${newStocks.length}）**\n`);
        if (newStocks.length > 0) {
            newStocks.forEach((item, index) => {
                content.push(`${index + 1}. ${item.name}(${code6(item)}) ${plate2(item)}\n`);
            });
        }
        else {
            content.push(`> 无\n`);
        }
        const results = await Promise.allSettled([
            this.sendFeishu(feishuWebhookUrls[0], feishuSigningSecrets[0], card),
            this.pushMsg2Robot({
                msgtype: 'markdown',
                markdown: { content: content.join('') },
            }),
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
    async pushFeishuMarkdown(content) {
        const card = {
            msg_type: 'interactive',
            card: {
                config: { wide_screen_mode: true },
                elements: [
                    {
                        tag: 'div',
                        text: { tag: 'lark_md', content },
                    },
                ],
            },
        };
        return Promise.allSettled(feishuWebhookUrls.map((webhookUrl, index) => this.sendFeishu(webhookUrl, feishuSigningSecrets[index], card)));
    }
    async sendFeishu(webhookUrl, secret, card) {
        const body = secret ? Object.assign(Object.assign({}, card), this.createFeishuSignature(secret)) : card;
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
    createFeishuSignature(secret) {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const stringToSign = `${timestamp}\n${secret}`;
        const sign = (0, crypto_1.createHmac)('sha256', stringToSign)
            .update('')
            .digest('base64');
        return { timestamp, sign };
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
    (0, common_1.Injectable)()
], PushService);
exports.PushService = PushService;
//# sourceMappingURL=push.service.js.map