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
var wechatNotice_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.wechatNotice = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const hotList_entity_1 = require("../entities/hotList.entity");
const typeorm_2 = require("@nestjs/typeorm");
const node_fetch_1 = require("node-fetch");
let wechatNotice = wechatNotice_1 = class wechatNotice {
    constructor(hotListRp) {
        this.hotListRp = hotListRp;
        this.logger = new common_1.Logger(wechatNotice_1.name);
    }
    async notice() {
        const body = {
            msgtype: 'text',
            text: {
                content: '广州今日天气：29度，大部分多云，降雨概率：60%',
                mentioned_list: ['wangqing', '@all'],
                mentioned_mobile_list: ['13800001111', '@all'],
            },
        };
        (0, node_fetch_1.default)('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=474f2a05-c848-4049-b7f0-90630374a408', {
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
        })
            .then(async (response) => await response.text())
            .then(data => console.log(data))
            .catch(e => console.error(e));
    }
};
wechatNotice = wechatNotice_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(hotList_entity_1.hotList)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], wechatNotice);
exports.wechatNotice = wechatNotice;
//# sourceMappingURL=wechatNotice.service.js.map