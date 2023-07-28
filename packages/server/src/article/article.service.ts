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
    const newUser = await this.articleRp.create(createArticleDto);
    return await this.articleRp.save(newUser);
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
    const updateUser = await this.articleRp.findOne({ where: { id } });
    if (!updateUser) {
      throw new Error(`User with id ${id} not found.`);
    }
    await this.articleRp.merge(updateUser, updateTestDto);
    return await this.articleRp.update(id, updateUser);
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