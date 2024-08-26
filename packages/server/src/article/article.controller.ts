import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ArticleService } from './article.service';
// import { Public } from '../decorator/public.decorator';
import { CreateArticleDto } from './dto/create-article.dto';

@Controller('article')
export class ArticleController {
  constructor(private articleService: ArticleService) { }

  @Post('create')
  async create(@Body() createArticleDto: CreateArticleDto) {
    const result = await this.articleService.create(createArticleDto);
    return {
      code: 0,
      data: result,
    };
  }

  @Post('remove')
  async remove(@Body('id') id: any) {
    const result = await this.articleService.remove(id);
    return {
      code: 0,
      data: result,
    };
  }

  @Post('update')
  async update(@Body() updateArticleDto: CreateArticleDto) {
    const id = updateArticleDto.id;
    delete updateArticleDto.id;
    const result = await this.articleService.update(id, updateArticleDto);
    return {
      code: 0,
      data: result,
    };
  }

  // @Public()
  @Get('findAll')
  async findAll() {
    const result = await this.articleService.findAll();
    return {
      code: 0,
      data: result,
    };
  }
  @Get('findOne')
  async findOne(@Query('id') id: number) {
    const result = await this.articleService.findOne(id);
    return {
      code: 0,
      data: result,
    };
  }

  @Get('findByTitle')
  async findByTitle(@Query('title') title: string): Promise<any | undefined> {
    return this.articleService.findByTitle(title);
  }
}
