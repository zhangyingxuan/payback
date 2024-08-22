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
const fetchUtil_1 = require("../core/fetchUtil");
const qyWechatNotice_service_1 = require("./qyWechatNotice.service");
const thsUrl = {
    getSelfStockWithMarket: 'https://t.10jqka.com.cn/newcircle/group/getSelfStockWithMarket',
    getAllSelfStock: 'https://www.iwencai.com/unifiedwap/self-stock/plate/list',
    get: 'http://pop.10jqka.com.cn/getselfstockinfo.php',
    modify: 'http://stock.10jqka.com.cn/self.php',
    modifySelfStock: 'https://t.10jqka.com.cn/newcircle/group/modifySelfStock/',
};
let ApiTestService = ApiTestService_1 = class ApiTestService {
    constructor(hotListRp, qyWechatNotice) {
        this.hotListRp = hotListRp;
        this.qyWechatNotice = qyWechatNotice;
        this.logger = new common_1.Logger(ApiTestService_1.name);
    }
    async notice() {
        const body = {
            msgtype: 'markdown',
            text: {
                content: '广州今日天气：29度，大部分多云，降雨概率：60%',
                mentioned_list: ['yxuanzhang'],
            },
        };
        return await this.qyWechatNotice.notice(ApiTestService_1.name, `[crawlfundsData]出错了：${JSON.stringify(body)}`);
    }
    async fetchHotList() {
        (0, node_fetch_1.default)('https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112309386087809528996_1689650979956&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=1689650979958')
            .then(async (response) => await response.text())
            .then(data => console.log(data))
            .catch(e => console.error(e));
    }
    async getThsSelfStocks() {
        (0, node_fetch_1.default)(thsUrl.get, {
            headers: {
                accept: 'application/json, text/plain, */*',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
                'content-type': 'application/json',
                pragma: 'no-cache',
                Cookie: 'MDptb182MzE0MTAzMTc6Ok5vbmU6NTAwOjY0MTQxMDMxNzo3LDExMTExMTExMTExLDQwOzQ0LDExLDQwOzYsMSw0MDs1LDEsNDA7MSwxMDEsNDA7MiwxLDQwOzMsMSw0MDs1LDEsNDA7OCwwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMSw0MDsxMDIsMSw0MDoyNzo6OjYzMTQxMDMxNzoxNjg5NzUwNDI1Ojo6MTY1MDk4ODUwMDo2MDQ4MDA6MDoxOTI0MDRlYjVjZjIwMTZiNDQxMjkxZGJjZTIwMWEzZDM6ZGVmYXVsdF80OjE',
            },
        })
            .then(data => console.log(data))
            .catch(e => console.error(e));
    }
    async datacenterWeb() {
        const dateTime = new Date().getTime();
        const url = `https://datacenter-web.eastmoney.com/api/data/v1/get?callback=jQuery112304542900785353563_${dateTime}&reportName=RPT_MUTUAL_QUOTA&columns=TRADE_DATE%2CMUTUAL_TYPE%2CBOARD_TYPE%2CMUTUAL_TYPE_NAME%2CFUNDS_DIRECTION%2CINDEX_CODE%2CINDEX_NAME%2CBOARD_CODE&quoteColumns=status~07~BOARD_CODE%2CdayNetAmtIn~07~BOARD_CODE%2CdayAmtRemain~07~BOARD_CODE%2CdayAmtThreshold~07~BOARD_CODE%2Cf104~07~BOARD_CODE%2Cf105~07~BOARD_CODE%2Cf106~07~BOARD_CODE%2Cf3~03~INDEX_CODE~INDEX_f3%2CnetBuyAmt~07~BOARD_CODE&quoteType=0&pageNumber=1&pageSize=200&sortTypes=1&sortColumns=MUTUAL_TYPE&source=WEB&client=WEB&_=${dateTime}`;
        console.log(url);
        (0, node_fetch_1.default)(url, {
            headers: {
                accept: '*/*',
                'accept-language': 'zh-CN,zh;q=0.9',
                'cache-control': 'no-cache',
                pragma: 'no-cache',
                'sec-ch-ua': '"Not/A)Brand";v="99", "Google Chrome";v="115", "Chromium";v="115"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"macOS"',
                'sec-fetch-dest': 'script',
                'sec-fetch-mode': 'no-cors',
                'sec-fetch-site': 'same-site',
            },
            referrer: 'https://data.eastmoney.com/hsgt/index.html',
            referrerPolicy: 'unsafe-url',
            body: null,
            method: 'GET',
            mode: 'cors',
            credentials: 'include',
        })
            .then(async (response) => await response.text())
            .then(data => console.log(data))
            .catch(e => console.error(e));
    }
    async otherTest() {
        const chooseStock1ExpectedRs = await (0, fetchUtil_1.fetchAllStocksByIwencai)('竞价看多；竞价抢筹；竞价涨幅>0；10个交易日内有涨停；昨日未涨停；集中度70<=11；昨日收盘获利>=50%；行业；股价低于30元；流通市值<=120亿；流通市值>=20亿；非创业板；非科创板；非ST');
        console.log(chooseStock1ExpectedRs);
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
    __metadata("design:paramtypes", [typeorm_1.Repository,
        qyWechatNotice_service_1.QyWechatNotice])
], ApiTestService);
exports.ApiTestService = ApiTestService;
//# sourceMappingURL=apiTest.service.js.map