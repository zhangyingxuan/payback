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
var ApiTestService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiTestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const hotList_entity_1 = require("../entities/hotList.entity");
const typeorm_2 = require("@nestjs/typeorm");
const node_fetch_1 = require("node-fetch");
const hexin_v_js_1 = require("../core/hexin-v.js");
const zlib = require('node:zlib');
const apiUrls = {
    conceptPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate',
    industryPlate: 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/plate?type=industry',
    iwencaiRoboot: 'https://www.iwencai.com/customized/chart/get-robot-data',
};
let ApiTestService = ApiTestService_1 = class ApiTestService {
    constructor(hotListRp) {
        this.hotListRp = hotListRp;
        this.logger = new common_1.Logger(ApiTestService_1.name);
    }
    async fetchExternalData() {
        const body = {
            "source": "Ths_iwencai_Xuangu",
            "version": "2.0",
            "question": "连续涨停天数>=1；不包含新股；不包含ST；几天几板；涨停原因；封板金额；成交额；同花顺二级行业；",
            "perpage": 100,
            "page": 1,
        };
        const result = await (0, node_fetch_1.default)("https://www.iwencai.com/customized/chart/get-robot-data", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "zh-CN,zh;q=0.9",
                "cache-control": "no-cache",
                "content-type": "application/json",
                "hexin-v": (0, hexin_v_js_1.createV)(),
                "pragma": "no-cache"
            },
            "body": JSON.stringify(body),
            "method": "POST",
        });
        console.log(await result.json());
    }
    async fetchHotList() {
        (0, node_fetch_1.default)("https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112309386087809528996_1689650979956&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=1689650979958")
            .then(async (response) => await response.text()).then(data => console.log(data)).catch(e => console.error(e));
    }
    async findAll() {
        return await this.hotListRp.find();
    }
    async findByLimit(len = 20) {
        return await this.hotListRp
            .createQueryBuilder('hot_list_data')
            .offset(0)
            .limit(len)
            .orderBy('createTime', 'DESC')
            .getMany();
    }
};
ApiTestService = ApiTestService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(hotList_entity_1.hotList)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], ApiTestService);
exports.ApiTestService = ApiTestService;
//# sourceMappingURL=apiTest.service.js.map