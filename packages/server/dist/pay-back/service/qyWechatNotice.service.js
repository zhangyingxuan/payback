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
var QyWechatNotice_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QyWechatNotice = void 0;
const common_1 = require("@nestjs/common");
const node_fetch_1 = require("node-fetch");
const dayjs = require("dayjs");
let QyWechatNotice = QyWechatNotice_1 = class QyWechatNotice {
    constructor() {
        this.logger = new common_1.Logger(QyWechatNotice_1.name);
    }
    async notice(serviceName, msgContent = '哎哟，不错哦') {
        const todayDateStr = new Date();
        const body = {
            msgtype: 'markdown',
            markdown: {
                content: `服务告警 <font color=\"warning\">[${serviceName}]</font> <font color=\"comment\">${dayjs(todayDateStr).format('MM-DD HH:mm:ss')}</font>\n
        > 错误日志: <font color=\"comment\">${msgContent}</font>`,
                mentioned_list: ['yxuanzhang', '@all'],
                mentioned_mobile_list: ['13800001111', '@all'],
            },
        };
        return await (0, node_fetch_1.default)('https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=474f2a05-c848-4049-b7f0-90630374a408', {
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
            .then(async (response) => await response.json())
            .then(data => {
            console.log(data);
            return data;
        })
            .catch(e => console.error(e));
    }
};
QyWechatNotice = QyWechatNotice_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], QyWechatNotice);
exports.QyWechatNotice = QyWechatNotice;
//# sourceMappingURL=qyWechatNotice.service.js.map