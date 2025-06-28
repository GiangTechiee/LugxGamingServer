// src/genres/genres.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';

@Injectable()
export class GenresService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới một genre
  async create(createGenreDto: CreateGenreDto) {
    return await this.prisma.genres.create({
      data: {
        name: createGenreDto.name,
        description: createGenreDto.description,
      },
    });
  }

  // Lấy tất cả genres
  async findAll() {
    return await this.prisma.genres.findMany({
      include: {
        game_genres: {
          include: {
            game: { select: { title: true } },
          },
        },
      },
    });
  }

  // Lấy một genre theo ID
  async findOne(id: number) {
    return await this.prisma.genres.findUniqueOrThrow({
      where: { genre_id: id },
      include: {
        game_genres: {
          include: {
            game: { select: { title: true } },
          },
        },
      },
    });
  }

  // Cập nhật một genre
  async update(id: number, updateGenreDto: UpdateGenreDto) {
    return await this.prisma.genres.update({
      where: { genre_id: id },
      data: {
        name: updateGenreDto.name,
        description: updateGenreDto.description,
      },
    });
  }

  // Xóa một genre
  async remove(id: number) {
    return await this.prisma.genres.delete({
      where: { genre_id: id },
    });
  }
}