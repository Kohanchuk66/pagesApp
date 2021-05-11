import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { PagesService } from './pages.service';
import { ConfigService } from '@nestjs/config';
import { UpdatePageDto } from './dto/update-page.dto';
import { Page } from '../interfaces/page';

@Controller('pages')
export class PagesController {
  constructor(
    private readonly pagesService: PagesService,
    private configService: ConfigService,
  ) {}

  @Get()
  getAll(): Promise<Record<string, any>> {
    return this.pagesService.getAll();
  }

  @Get(':id')
  getOne(@Param('id') id: string): Promise<Page> {
    return this.pagesService.getById(id);
  }

  @Post()
  createPage(@Body() createPageDto: CreatePageDto): Promise<Page> {
    return this.pagesService.create(createPageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<Page> {
    return this.pagesService.remove(id);
  }

  @Put(':id')
  changePage(
    @Param('id') id: string,
    @Body() updatePageDto: UpdatePageDto,
  ): Promise<Page> {
    return this.pagesService.update(id, updatePageDto);
  }
}
