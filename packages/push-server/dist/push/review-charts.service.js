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
var ReviewChartsPushService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewChartsPushService = exports.renderChartParts = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const node_fetch_1 = require("node-fetch");
const resvg_js_1 = require("@resvg/resvg-js");
const push_service_1 = require("./push.service");
async function renderChartParts(encoded) {
    if (typeof encoded !== 'string' || encoded.length > 6 * 1024 * 1024)
        throw new Error('图表大小无效');
    const decoded = Buffer.from(encoded, 'base64');
    const svg = decoded.toString('utf8');
    const size = svg.match(/^<svg\b[^>]*\bwidth="(\d+)"[^>]*\bheight="(\d+)"/);
    if (decoded.toString('base64') !== encoded || !size || ![990, 1200].includes(+size[1]) || +size[2] < 1 || +size[2] > 60000
        || /<!DOCTYPE|<!ENTITY|<script|<foreignObject|\b(?:href|xlink:href)\s*=/i.test(svg)) {
        throw new Error('图表格式或尺寸无效');
    }
    const images = [];
    for (let y = 0; y < +size[2]; y += 1600) {
        const height = Math.min(1600, +size[2] - y);
        const part = `<svg xmlns="http://www.w3.org/2000/svg" width="${size[1]}" height="${height}" viewBox="0 ${y} ${size[1]} ${height}">${svg}</svg>`;
        const image = (await (0, resvg_js_1.renderAsync)(part, { font: { loadSystemFonts: true, defaultFontFamily: 'Noto Sans CJK SC' } })).asPng();
        if (image.length > 2 * 1024 * 1024)
            throw new Error('分图超过企微 2 MiB 限制');
        images.push(image);
    }
    return images;
}
exports.renderChartParts = renderChartParts;
let ReviewChartsPushService = ReviewChartsPushService_1 = class ReviewChartsPushService {
    constructor(pushService) {
        this.pushService = pushService;
        this.logger = new common_1.Logger(ReviewChartsPushService_1.name);
        this.date = '';
        this.sent = new Set();
        this.uploaded = new Map();
    }
    async push(payload) {
        if (this.pending) {
            if ((payload === null || payload === void 0 ? void 0 : payload.data_as_of) !== this.date)
                throw new Error('另一交易日的双图正在推送');
            return this.pending;
        }
        this.pending = this.deliver(payload).finally(() => { this.pending = undefined; });
        return this.pending;
    }
    async deliver(payload) {
        var _a, _b;
        if (!/^\d{4}-\d{2}-\d{2}$/.test((payload === null || payload === void 0 ? void 0 : payload.data_as_of) || '') || !Array.isArray(payload.charts)
            || payload.charts.length !== 2 || ((_a = payload.charts[0]) === null || _a === void 0 ? void 0 : _a.name) !== 'panorama' || ((_b = payload.charts[1]) === null || _b === void 0 ? void 0 : _b.name) !== 'ladder') {
            throw new Error('双图推送参数无效');
        }
        if (this.date !== payload.data_as_of) {
            this.date = payload.data_as_of;
            this.sent.clear();
            this.uploaded.clear();
        }
        const images = [];
        for (const chart of payload.charts)
            images.push(...await renderChartParts(chart.svg_base64));
        let token;
        const channels = [
            ...this.pushService.robotList.map((robot, index) => ({
                name: `wecom:${index}`,
                send: async (image) => {
                    const result = await this.pushService.qyapi(robot, {
                        msgtype: 'image', image: { base64: image.toString('base64'), md5: (0, crypto_1.createHash)('md5').update(image).digest('hex') },
                    });
                    if ((result === null || result === void 0 ? void 0 : result.errcode) !== 0)
                        throw new Error('企微图片推送失败');
                },
            })),
            ...push_service_1.feishuWebhookUrls.map((webhook, index) => ({
                name: `feishu:${index}`,
                send: async (image, imageIndex) => {
                    let key = this.uploaded.get(imageIndex);
                    if (!key) {
                        token !== null && token !== void 0 ? token : (token = this.getToken());
                        key = await this.upload(image, await token);
                        this.uploaded.set(imageIndex, key);
                    }
                    await this.pushService.sendFeishu(webhook, push_service_1.feishuSigningSecrets[index], {
                        msg_type: 'image', content: { image_key: key },
                    });
                },
            })),
        ];
        const results = await Promise.allSettled(channels.map(async (channel) => {
            for (let index = 0; index < images.length; index++) {
                const id = `${channel.name}:${index}`;
                if (this.sent.has(id))
                    continue;
                await channel.send(images[index], index);
                this.sent.add(id);
                if (index < images.length - 1)
                    await this.pause();
            }
        }));
        const failures = results.flatMap((result, index) => result.status === 'rejected' ? [channels[index].name] : []);
        if (failures.length)
            this.logger.error(`收盘双图推送失败通道：${failures.join(', ')}；请检查凭据、权限和机器人状态`);
        return { ok: failures.length === 0, failures };
    }
    pause() {
        return new Promise(resolve => setTimeout(resolve, 3100));
    }
    async getToken() {
        const appId = process.env.FEISHU_APP_ID;
        const appSecret = process.env.FEISHU_APP_SECRET;
        if (!appId || !appSecret)
            throw new Error('缺少 FEISHU_APP_ID / FEISHU_APP_SECRET，无法上传飞书图片');
        const response = await (0, node_fetch_1.default)('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
            method: 'POST', timeout: 15000, headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
        });
        const result = await response.json();
        if (!response.ok || result.code !== 0 || !result.tenant_access_token)
            throw new Error('获取飞书图片上传令牌失败');
        return result.tenant_access_token;
    }
    async upload(image, token) {
        var _a;
        const boundary = `review-${(0, crypto_1.randomUUID)()}`;
        const body = Buffer.concat([
            Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image_type"\r\n\r\nmessage\r\n--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="review.png"\r\nContent-Type: image/png\r\n\r\n`),
            image, Buffer.from(`\r\n--${boundary}--\r\n`),
        ]);
        const response = await (0, node_fetch_1.default)('https://open.feishu.cn/open-apis/im/v1/images', {
            method: 'POST', timeout: 15000, body,
            headers: { authorization: `Bearer ${token}`, 'content-type': `multipart/form-data; boundary=${boundary}` },
        });
        const result = await response.json();
        if (!response.ok || result.code !== 0 || !((_a = result.data) === null || _a === void 0 ? void 0 : _a.image_key))
            throw new Error('上传飞书图片失败，请检查应用图片权限');
        return result.data.image_key;
    }
};
ReviewChartsPushService = ReviewChartsPushService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [push_service_1.PushService])
], ReviewChartsPushService);
exports.ReviewChartsPushService = ReviewChartsPushService;
//# sourceMappingURL=review-charts.service.js.map