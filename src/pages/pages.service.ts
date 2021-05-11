import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePageDto } from './dto/create-page.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page } from '../interfaces/page';
import { v4 as uuid } from 'uuid';
import { UpdatePageDto } from './dto/update-page.dto';
import * as fs from 'fs';

@Injectable()
export class PagesService {
  constructor(@InjectModel('Page') private pageModel: Model<Page>) {}

  async getAll(): Promise<Page[]> {
    return this.pageModel.find().exec();
  }

  async getById(id: string) {
    return this.pageModel.findById(id);
  }

  async create(pageDto: CreatePageDto): Promise<Page> {
    const name = '^' + pageDto.name + '$';
    const productWithSameName = this.pageModel.find({
      name: { $regex: name, $options: 'i' },
    });
    if ((await productWithSameName.count()) != 0) {
      throw new BadRequestException('Account with this name already exists.');
    }

    const newProduct = new this.pageModel(pageDto);
    fs.writeFileSync(
      'contents/' + newProduct.alias + '_' + newProduct.id,
      newProduct.content,
    );
    return newProduct.save();
  }

  async remove(id: string) {
    return this.pageModel.findByIdAndRemove(id);
  }

  async update(id: string, pageDto: UpdatePageDto): Promise<Page> {
    return this.pageModel.findByIdAndUpdate(id, pageDto);
  }
}
