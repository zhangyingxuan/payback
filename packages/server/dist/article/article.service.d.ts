import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
export declare class ArticleService {
    private readonly articleRp;
    constructor(articleRp: Repository<Article>);
    create(createArticleDto: CreateArticleDto): Promise<any>;
    remove(id: number): Promise<any>;
    update(id: number, updateTestDto: CreateArticleDto): Promise<any>;
    findAll(): Promise<any>;
    findOne(id: number): Promise<any>;
    findByTitle(article: any): Promise<any | undefined>;
}
