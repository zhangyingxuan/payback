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
var ThsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThsService = void 0;
const common_1 = require("@nestjs/common");
const fetchUtil_1 = require("../core/fetchUtil");
const during = 1000;
let ThsService = ThsService_1 = class ThsService {
    constructor() {
        this.logger = new common_1.Logger(ThsService_1.name);
    }
    async modifyThsSelfStocks(evenBoardData, dailyLimitQuantity) {
        let isSuccess = true;
        this.logger.log('同步自选 开始');
        try {
            let times = 3;
            while (times--) {
                (function (i, _this) {
                    setTimeout(async () => {
                        _this.dealNetRequest(evenBoardData);
                    }, i * (dailyLimitQuantity + 1) * during);
                })(times, this);
            }
            this.logger.log('同步自选 成功');
        }
        catch (e) {
            isSuccess = false;
            this.logger.log('同步自选 失败了！' + e);
        }
        return {
            code: isSuccess ? 200 : 400,
            data: evenBoardData,
        };
    }
    dealNetRequest(evenBoardData) {
        const maxHeight = evenBoardData.maxHeight;
        for (let i = 1; i <= maxHeight; i++) {
            let stocks = evenBoardData[i + ''];
            if (stocks) {
                for (let j = 0; j < stocks.length; j++) {
                    (function (t, item) {
                        setTimeout(async () => {
                            const result = await (0, fetchUtil_1.modifyThsSelfStocks)(item.code);
                        }, t * during);
                    })(j, stocks[j]);
                }
            }
        }
    }
};
ThsService = ThsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], ThsService);
exports.ThsService = ThsService;
//# sourceMappingURL=ths.service.js.map