"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestConceptPlate = void 0;
const create_latest_concept_plate_1 = require("../dto/create-latest-concept-plate");
const fetchUtil_1 = require("../core/fetchUtil");
const config_1 = require("../core/config");
async function getLatestConceptPlate(currentLatestConceptPlate, cookie) {
    let createLatestConceptPlateArr = [];
    const latestConceptPlates = await (0, fetchUtil_1.fetchIwencaiApi)(config_1.iwencaiUrl + config_1.params.gainianPlate, 5, cookie);
    if ((currentLatestConceptPlate === null || currentLatestConceptPlate === void 0 ? void 0 : currentLatestConceptPlate.code) === (latestConceptPlates === null || latestConceptPlates === void 0 ? void 0 : latestConceptPlates[0]['code'])) {
        return null;
    }
    const index = latestConceptPlates.findIndex(item => {
        return item['code'] === (currentLatestConceptPlate === null || currentLatestConceptPlate === void 0 ? void 0 : currentLatestConceptPlate.code);
    });
    const latestConceptPlatesArr = latestConceptPlates.splice(0, index);
    const createTime = new Date();
    createLatestConceptPlateArr = latestConceptPlatesArr.map(item => {
        const createLatestConceptPlate = new create_latest_concept_plate_1.CreateLatestConceptPlate();
        createLatestConceptPlate.name = item['指数简称'];
        createLatestConceptPlate.code = item['code'];
        createLatestConceptPlate.createTime = createTime;
        return createLatestConceptPlate;
    });
    return createLatestConceptPlateArr.reverse();
}
exports.getLatestConceptPlate = getLatestConceptPlate;
//# sourceMappingURL=latestConceptPlateUtil.js.map