import { Module } from '@nestjs/common';
import { PagesService } from './pages.service';
import { PagesController } from './pages.controller';
import { MongooseModule } from '@nestjs/mongoose';
import * as schema from '../schemas/page.schema';
import { ConfigModule } from '@nestjs/config';

@Module({
  providers: [PagesService],
  controllers: [PagesController],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      {
        name: 'Page',
        schema: schema.pageSchema,
      },
    ]),
  ],
})
export class PagesModule {}
