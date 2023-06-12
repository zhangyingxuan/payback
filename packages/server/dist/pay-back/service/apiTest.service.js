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
        (0, node_fetch_1.default)("https://www.iwencai.com/customized/chart/get-robot-data", {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/json",
                "hexin-v": "Axq2opcfKpP9_6Y_lQ66qG3gbcs5S54nEM8SySSTxq14l7R1DNvuNeBfYtz3",
            },
            "body": "{\"source\":\"Ths_iwencai_Xuangu\",\"version\":\"2.0\",\"query_area\":\"\",\"block_list\":\"\",\"add_info\":\"{\\\"urp\\\":{\\\"scene\\\":1,\\\"company\\\":1,\\\"business\\\":1},\\\"contentType\\\":\\\"json\\\",\\\"searchInfo\\\":true}\",\"question\":\"行业板块主力资金；涨跌幅倒序\",\"perpage\":\"50\",\"page\":1,\"secondary_intent\":\"\",\"log_info\":\"{\\\"input_type\\\":\\\"click\\\"}\",\"rsh\":\"Ths_iwencai_Xuangu_cj7r4l37naa3g54vm4j6pk04xq86kyvq\"}",
            "method": "POST",
        }).then(response => response.json()).then(data => { var _a; return console.log(JSON.stringify((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.answer)); }).catch(e => console.error(e));
    }
    async fetchHotList() {
        (0, node_fetch_1.default)("https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1/stock?stock_type=a&type=hour&list_type=normal").then(response => response.json()).then(data => console.log(data)).catch(e => console.error(e));
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