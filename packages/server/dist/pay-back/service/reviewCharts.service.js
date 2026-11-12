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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ReviewChartsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewChartsService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const node_fetch_1 = require("node-fetch");
const rxjs_1 = require("rxjs");
const pay_back_core_1 = require("pay-back-core");
let ReviewChartsService = ReviewChartsService_1 = class ReviewChartsService {
    constructor(pushServer) {
        this.pushServer = pushServer;
        this.logger = new common_1.Logger(ReviewChartsService_1.name);
    }
    async pushDailyCharts() {
        var _a, _b;
        const date = (0, pay_back_core_1.toShanghaiDate)();
        if (((_a = this.snapshot) === null || _a === void 0 ? void 0 : _a.data_as_of) !== date) {
            const base = (process.env.PAYBACK_AGENT_URL || 'http://127.0.0.1:8300').replace(/\/$/, '');
            const response = await (0, node_fetch_1.default)(`${base}/review-charts/${date}`, { method: 'POST', timeout: 90000 });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error || '生成收盘双图失败');
            if (result.data_as_of !== date || !Array.isArray(result.charts))
                throw new Error('双图数据日期或格式错误');
            this.snapshot = result;
        }
        const result = await (0, rxjs_1.lastValueFrom)(this.pushServer.send('pushReviewCharts', this.snapshot).pipe((0, rxjs_1.timeout)(300000)));
        if ((result === null || result === void 0 ? void 0 : result.ok) !== true)
            throw new Error(`收盘双图未全部送达：${((_b = result === null || result === void 0 ? void 0 : result.failures) === null || _b === void 0 ? void 0 : _b.join(', ')) || '回执无效'}`);
        this.logger.log(`${date} 复盘全景图和涨停梯队图已推送飞书、企微`);
    }
};
ReviewChartsService = ReviewChartsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('PUSH_SERVER')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy])
], ReviewChartsService);
exports.ReviewChartsService = ReviewChartsService;
//# sourceMappingURL=reviewCharts.service.js.map