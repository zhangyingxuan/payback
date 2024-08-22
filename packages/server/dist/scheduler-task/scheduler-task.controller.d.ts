import { ArticleService } from './scheduler-task.service';
import { CreateArticleDto } from './dto/create-article.dto';
export declare class ArticleController {
    private articleService;
    constructor(articleService: ArticleService);
    create(createArticleDto: CreateArticleDto): Promise<{
        code: number;
        data: any;
    }>;
    remove(id: any): Promise<{
        code: number;
        data: any;
    }>;
    update(updateArticleDto: CreateArticleDto): Promise<{
        code: number;
        data: any;
    }>;
    findAll(): Promise<{
        code: number;
        data: any;
    }>;
    findOne(id: number): Promise<{
        code: number;
        data: any;
    }>;
    findByTitle(title: string): Promise<any | undefined>;
}
