import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGameDto } from './dto/create-game.dto';
import { UpdateGameDto } from './dto/update-game.dto';
import { FindAllGameDto } from './dto/find-all-game.dto';

@Injectable()
export class GamesService {
  constructor(private readonly prisma: PrismaService) {}

  // Tạo mới một game
  async create(createGameDto: CreateGameDto) {
    return await this.prisma.games.create({
      data: {
        title: createGameDto.title,
        description: createGameDto.description,
        price: createGameDto.price,
        discount_price: createGameDto.discount_price,
        developer: createGameDto.developer,
        publisher: createGameDto.publisher,
        release_date: createGameDto.release_date ? new Date(createGameDto.release_date) : null,
        is_hot: createGameDto.is_hot || false,
        game_genres: {
          create: createGameDto.genre_ids?.map((genre_id) => ({
            genre: { connect: { genre_id } },
          })),
        },
        game_platforms: {
          create: createGameDto.platform_ids?.map((platform_id) => ({
            platform: { connect: { platform_id } },
          })),
        },
        game_images: {
          create: createGameDto.image_urls?.map((image, index) => ({
            image_url: image.url,
            alt_text: image.alt_text,
            order_index: index + 1,
          })),
        },
      },
      include: {
        game_genres: { include: { genre: true } },
        game_platforms: { include: { platform: true } },
        game_images: true,
      },
    });
  }

  // Lấy tất cả games
  async findAll(take: number = 12, skip: number = 0): Promise<FindAllGameDto[]> {
    return await this.prisma.games.findMany({
      take,
      skip,
      select: {
        game_id: true,
        title: true,
        price: true,
        discount_price: true,
        game_platforms: {
          select: {
            platform: {
              select: { name: true },
            },
          },
        },
        game_images: {
          select: { image_url: true },
          where: { order_index: 1 },
          take: 1,
        },
      },
      orderBy: { game_id: 'asc' }, // Sắp xếp theo game_id để đảm bảo thứ tự nhất quán
    }).then(games => games.map(game => ({
      game_id: game.game_id,
      title: game.title,
      price: Number(game.price),
      discount_price: game.discount_price ? Number(game.discount_price) : undefined,
      platforms: game.game_platforms.map(gp => ({ name: gp.platform.name })),
      thumbnail: game.game_images[0]?.image_url,
    })));
  }

  // Lấy games sắp xếp theo ngày cập nhật mới nhất (giảm dần)
  async findByLatestUpdate(take: number = 12, skip: number = 0): Promise<FindAllGameDto[]> {
    return await this.prisma.games.findMany({
      take,
      skip,
      select: {
        game_id: true,
        title: true,
        price: true,
        discount_price: true,
        is_hot: true,
        updated_at: true, // Thêm updated_at để có thể kiểm tra
        game_platforms: {
          select: {
            platform: {
              select: { name: true },
            },
          },
        },
        game_images: {
          select: { image_url: true },
          where: { order_index: 1 },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' }, // Sắp xếp theo ngày cập nhật mới nhất
    }).then(games => games.map(game => ({
      game_id: game.game_id,
      title: game.title,
      price: Number(game.price),
      discount_price: game.discount_price ? Number(game.discount_price) : undefined,
      is_hot: game.is_hot,
      platforms: game.game_platforms.map(gp => ({ name: gp.platform.name })),
      thumbnail: game.game_images[0]?.image_url,
    })));
  }

  // Lấy các game hot
  async findHotGames(take: number = 12, skip: number = 0): Promise<FindAllGameDto[]> {
    return await this.prisma.games.findMany({
      where: {
        is_hot: true, // Chỉ lấy games có is_hot = true
      },
      take,
      skip,
      select: {
        game_id: true,
        title: true,
        price: true,
        discount_price: true,
        game_platforms: {
          select: {
            platform: {
              select: { name: true },
            },
          },
        },
        game_images: {
          select: { image_url: true },
          where: { order_index: 1 },
          take: 1,
        },
      },
      orderBy: [
        { updated_at: 'desc' }, // Sắp xếp game hot theo ngày cập nhật mới nhất
        { game_id: 'asc' }      // Backup sort theo game_id
      ],
    }).then(games => games.map(game => ({
      game_id: game.game_id,
      title: game.title,
      price: Number(game.price),
      discount_price: game.discount_price ? Number(game.discount_price) : undefined,
      platforms: game.game_platforms.map(gp => ({ name: gp.platform.name })),
      thumbnail: game.game_images[0]?.image_url,
    })));
  }

  // Lấy game theo thể loại (genre_id)
  async findByGenre(genre_id: number, take: number = 12, skip: number = 0): Promise<FindAllGameDto[]> {
    return await this.prisma.games.findMany({
      where: {
        game_genres: {
          some: {
            genre_id,
          },
        },
      },
      take,
      skip,
      select: {
        game_id: true,
        title: true,
        price: true,
        discount_price: true,
        game_platforms: {
          select: {
            platform: {
              select: { name: true },
            },
          },
        },
        game_images: {
          select: { image_url: true },
          where: { order_index: 1 },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' },
    }).then(games => games.map(game => ({
      game_id: game.game_id,
      title: game.title,
      price: Number(game.price),
      discount_price: game.discount_price ? Number(game.discount_price) : undefined,
      platforms: game.game_platforms.map(gp => ({ name: gp.platform.name })),
      thumbnail: game.game_images[0]?.image_url,
    })));
  }

  // Lấy game theo tên nền tảng
  async findByPlatformName(platformName: string, take: number = 12, skip: number = 0): Promise<FindAllGameDto[]> {
    return await this.prisma.games.findMany({
      where: {
        game_platforms: {
          some: {
            platform: {
              name: {
                equals: platformName,
                mode: 'insensitive',
              },
            },
          },
        },
      },
      take,
      skip,
      select: {
        game_id: true,
        title: true,
        price: true,
        discount_price: true,
        game_platforms: {
          select: {
            platform: {
              select: { name: true },
            },
          },
        },
        game_images: {
          select: { image_url: true },
          where: { order_index: 1 },
          take: 1,
        },
      },
      orderBy: { updated_at: 'desc' },
    }).then(games => games.map(game => ({
      game_id: game.game_id,
      title: game.title,
      price: Number(game.price),
      discount_price: game.discount_price ? Number(game.discount_price) : undefined,
      platforms: game.game_platforms.map(gp => ({ name: gp.platform.name })),
      thumbnail: game.game_images[0]?.image_url,
    })));
  }

  // Lấy ngẫu nhiên một game_id
  async findRandomGameId(): Promise<number> {
    const games = await this.prisma.games.findMany({
      select: { game_id: true },
    });
    if (games.length === 0) {
      throw new Error('Không có game nào trong cơ sở dữ liệu');
    }
    const randomIndex = Math.floor(Math.random() * games.length);
    return games[randomIndex].game_id;
  }

  // Lấy một game theo ID
  async findOne(id: number) {
    return await this.prisma.games.findUniqueOrThrow({
      where: { game_id: id },
      include: {
        game_genres: { include: { genre: true } },
        game_platforms: { include: { platform: true } },
        game_images: true,
        reviews: { 
          select: { 
            rating: true, 
            comment: true,
            created_at: true,
            user: { select: { username: true}}
          } 
        },
      },
    });
  }

  // Cập nhật một game
  async update(id: number, updateGameDto: UpdateGameDto) {
    return await this.prisma.games.update({
      where: { game_id: id },
      data: {
        title: updateGameDto.title,
        description: updateGameDto.description,
        price: updateGameDto.price,
        discount_price: updateGameDto.discount_price,
        developer: updateGameDto.developer,
        publisher: updateGameDto.publisher,
        release_date: updateGameDto.release_date ? new Date(updateGameDto.release_date) : undefined,
        is_hot: updateGameDto.is_hot,
        game_genres: updateGameDto.genre_ids
          ? {
              deleteMany: {},
              create: updateGameDto.genre_ids.map((genre_id) => ({
                genre: { connect: { genre_id } },
              })),
            }
          : undefined,
        game_platforms: updateGameDto.platform_ids
          ? {
              deleteMany: {},
              create: updateGameDto.platform_ids.map((platform_id) => ({
                platform: { connect: { platform_id } },
              })),
            }
          : undefined,
        game_images: updateGameDto.image_urls
          ? {
              deleteMany: {},
              create: updateGameDto.image_urls.map((image, index) => ({
                image_url: image.url,
                alt_text: image.alt_text,
                order_index: index + 1,
              })),
            }
          : undefined,
      },
      include: {
        game_genres: { include: { genre: true } },
        game_platforms: { include: { platform: true } },
        game_images: true,
      },
    });
  }

  // Cập nhật trạng thái hot của game
  async updateHotStatus(id: number, isHot: boolean) {
    return await this.prisma.games.update({
      where: { game_id: id },
      data: { is_hot: isHot },
      select: {
        game_id: true,
        title: true,
        is_hot: true,
      },
    });
  }

  // Xóa một game
  async remove(id: number) {
    return await this.prisma.games.delete({
      where: { game_id: id },
    });
  }
}