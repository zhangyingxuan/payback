import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
export declare class ArticleService {
    private readonly articleRp;
    constructor(articleRp: Repository<Article>);
    create(createArticleDto: CreateArticleDto): Promise<Article>;
    remove(id: number): Promise<Article>;
    update(id: number, updateTestDto: CreateArticleDto): Promise<import("typeorm").UpdateResult>;
    findAll(): Promise<Article[]>;
    findOne(id: number): Promise<Article>;
    findByTitle(article: any): Promise<any | undefined>;
}
