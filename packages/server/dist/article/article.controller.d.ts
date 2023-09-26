import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
export declare class ArticleController {
    private articleService;
    constructor(articleService: ArticleService);
    create(createArticleDto: CreateArticleDto): Promise<{
        code: number;
        data: import("./entities/article.entity").Article;
    }>;
    remove(id: any): Promise<{
        code: number;
        data: import("./entities/article.entity").Article;
    }>;
    update(updateArticleDto: CreateArticleDto): Promise<{
        code: number;
        data: import("typeorm").UpdateResult;
    }>;
    findAll(): Promise<{
        code: number;
        data: import("./entities/article.entity").Article[];
    }>;
    findOne(id: number): Promise<{
        code: number;
        data: import("./entities/article.entity").Article;
    }>;
    findByTitle(title: string): Promise<any | undefined>;
}
