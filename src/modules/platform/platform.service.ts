import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePlatformDto } from './dto/create-platform.dto';
import { UpdatePlatformDto } from './dto/update-platform.dto';

@Injectable()
export class PlatformsService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới một platform
  async create(createPlatformDto: CreatePlatformDto) {
    return await this.prisma.platforms.create({
      data: {
        name: createPlatformDto.name,
        description: createPlatformDto.description,
      },
      include: {
        game_platforms: { include: { game: { select: { title: true } } } },
      },
    });
  }

  // Lấy tất cả platforms
  async findAll() {
    return await this.prisma.platforms.findMany({
      include: {
        game_platforms: { include: { game: { select: { title: true } } } },
      },
    });
  }

  // Lấy một platform theo ID
  async findOne(id: number) {
    return await this.prisma.platforms.findUniqueOrThrow({
      where: { platform_id: id },
      include: {
        game_platforms: { include: { game: { select: { title: true } } } },
      },
    });
  }

  // Cập nhật một platform
  async update(id: number, updatePlatformDto: UpdatePlatformDto) {
    return await this.prisma.platforms.update({
      where: { platform_id: id },
      data: {
        name: updatePlatformDto.name,
        description: updatePlatformDto.description,
      },
      include: {
        game_platforms: { include: { game: { select: { title: true } } } },
      },
    });
  }

  // Xóa một platform
  async remove(id: number) {
    return await this.prisma.platforms.delete({
      where: { platform_id: id },
    });
  }
}