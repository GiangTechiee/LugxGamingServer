// src/genres/genres.module.ts
import { Module } from '@nestjs/common';
import { GenresService } from './genre.service';
import { GenresController } from './genre.controller';
import { PrismaModule } from '../../prisma/prisma.module'; 

@Module({
  imports: [PrismaModule],
  controllers: [GenresController],
  providers: [GenresService],
  exports: [GenresService], 
})
export class GenresModule {}