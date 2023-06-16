"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHotListData = void 0;
const create_hot_list_dto_1 = require("../dto/create-hot-list.dto");
const common_1 = require("@nestjs/common");
const transformDataUtil_1 = require("./transformDataUtil");
const node_fetch_1 = require("node-fetch");
const logger = new common_1.Logger('hotListUtil');
async function getHotListData() {
    const createHotListDto = new create_hot_list_dto_1.CreateHotListDto();
    const baseUrl = 'https://dq.10jqka.com.cn/fuyao/hot_list_data/out/hot_list/v1';
    const normal = (0, node_fetch_1.default)(baseUrl + "/stock?stock_type=a&type=hour&list_type=normal");
    const value = (0, node_fetch_1.default)(baseUrl + "/stock?stock_type=a&type=day&list_type=value");
    const concept = (0, node_fetch_1.default)(baseUrl + "/plate?type=concept");
    const industry = (0, node_fetch_1.default)(baseUrl + "/plate?type=industry");
    const maxAmount10 = 10;
    const maxAmount5 = 5;
    try {
        const [stockNormal, stockValue, plateConcept, plateIndustry] = await Promise.all([normal, value, concept, industry]).then(async ([d1, d2, d3, d4]) => {
            const normalStock = (await d1.json()).data.stock_list.splice(0, maxAmount10);
            const valueStock = (await d2.json()).data.stock_list.splice(0, maxAmount10);
            const conceptPlate = (await d3.json()).data.plate_list.splice(0, maxAmount5);
            const industryPlate = (await d4.json()).data.plate_list.splice(0, maxAmount5);
            return [normalStock, valueStock, conceptPlate, industryPlate];
        });
        createHotListDto.stockNormal = (0, transformDataUtil_1.transformStockData)(stockNormal);
        createHotListDto.stockValue = (0, transformDataUtil_1.transformStockData)(stockValue);
        createHotListDto.plateConcept = (0, transformDataUtil_1.transformPlateData)(plateConcept);
        createHotListDto.plateIndustry = (0, transformDataUtil_1.transformPlateData)(plateIndustry);
        return createHotListDto;
    }
    catch (e) {
        console.log(e);
    }
    ;
}
exports.getHotListData = getHotListData;
//# sourceMappingURL=hotListUtil.js.map