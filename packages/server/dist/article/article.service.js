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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArticleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const article_entity_1 = require("./entities/article.entity");
const typeorm_2 = require("@nestjs/typeorm");
let ArticleService = class ArticleService {
    constructor(articleRp) {
        this.articleRp = articleRp;
    }
    async create(createArticleDto) {
        const createTime = new Date();
        createArticleDto.createTime = createTime;
        createArticleDto.updatedTime = createTime;
        const newArticle = await this.articleRp.create(createArticleDto);
        return await this.articleRp.save(newArticle);
    }
    async remove(id) {
        const userToRemove = await this.articleRp.findOneOrFail({
            where: { id },
        });
        if (!userToRemove) {
            throw new Error(`User with id ${id} not found.`);
        }
        return await this.articleRp.remove(userToRemove);
    }
    async update(id, updateTestDto) {
        updateTestDto.updatedTime = new Date();
        const updateArticle = await this.articleRp.findOne({ where: { id } });
        if (!updateArticle) {
            throw new Error(`User with id ${id} not found.`);
        }
        await this.articleRp.merge(updateArticle, updateTestDto);
        return await this.articleRp.update(id, updateArticle);
    }
    async findAll() {
        return await this.articleRp.find();
    }
    async findOne(id) {
        return await this.articleRp.findOne({ where: { id } });
    }
    async findByTitle(article) {
        const result = await this.articleRp.findOne({ where: { title: article.title } });
        return result;
    }
};
ArticleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(article_entity_1.Article)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], ArticleService);
exports.ArticleService = ArticleService;
//# sourceMappingURL=article.service.js.map