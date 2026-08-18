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
var ReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const review_entity_1 = require("../entities/review.entity");
const typeorm_2 = require("@nestjs/typeorm");
const dayjs = require("dayjs");
let ReviewService = ReviewService_1 = class ReviewService {
    constructor(reviewDataRp) {
        this.reviewDataRp = reviewDataRp;
        this.logger = new common_1.Logger(ReviewService_1.name);
    }
    async findAll() {
        return await this.reviewDataRp.find();
    }
    async findByLimit(len = 20) {
        return await this.reviewDataRp
            .createQueryBuilder('market_data')
            .offset(0)
            .limit(len)
            .orderBy('createTime', 'DESC')
            .getMany();
    }
    async findByDate(date) {
        return await this.reviewDataRp
            .createQueryBuilder('market_data')
            .offset(0)
            .where('market_data.createTime like :createTime', { createTime: dayjs(date).format('YYYY-MM-DD') + '%' })
            .orderBy('createTime', 'DESC')
            .getOne();
    }
};
ReviewService = ReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(review_entity_1.reviewData)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], ReviewService);
exports.ReviewService = ReviewService;
//# sourceMappingURL=review.service.js.map