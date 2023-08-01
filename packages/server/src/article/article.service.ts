import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article) private readonly articleRp: Repository<Article>
  ) { }

  async create(createArticleDto: CreateArticleDto) {
    // 前端传入数据createTestDto
    createArticleDto.createTime = new Date();
    const newArticle = await this.articleRp.create(createArticleDto);
    return await this.articleRp.save(newArticle);
  }

  async remove(id: number) {
    const userToRemove = await this.articleRp.findOneOrFail({
      where: { id },
    });
    if (!userToRemove) {
      throw new Error(`User with id ${id} not found.`);
    }
    return await this.articleRp.remove(userToRemove);
  }

  async update(id: number, updateTestDto: CreateArticleDto) {
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

  async findOne(id: number) {
    return await this.articleRp.findOne({ where: { id } });
  }

  async findByTitle(article: any): Promise<any | undefined> {
    const result = await this.articleRp.findOne({ where: { title: article.title } })
    return result;
  }
}