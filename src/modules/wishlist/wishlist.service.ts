import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { ForbiddenException } from '@nestjs/common/exceptions';
import { UserRole } from '@prisma/client';

@Injectable()
export class WishlistService {
  constructor(private readonly prisma: PrismaService) {}

  // Thêm game vào wishlist của user
  async create(
    createWishlistDto: CreateWishlistDto,
    currentUser: { user_id: number; role: UserRole },
  ) {
    if (
      currentUser.role === UserRole.CUSTOMER &&
      currentUser.user_id !== createWishlistDto.user_id
    ) {
      throw new ForbiddenException(
        'Bạn chỉ có thể thêm vào wishlist của chính mình',
      );
    }

    return await this.prisma.wishlist.create({
      data: {
        user_id: createWishlistDto.user_id,
        game_id: createWishlistDto.game_id,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Lấy tất cả wishlist
  async findAll(
    user_id?: number,
    currentUser?: { user_id: number; role: UserRole },
  ) {
    if (currentUser && currentUser.role === UserRole.CUSTOMER) {
      user_id = currentUser.user_id; //chỉ lấy id hiện tại của user
    }

    return await this.prisma.wishlist.findMany({
      where: user_id ? { user_id } : undefined,
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Lấy một mục wishlist theo ID
  async findOne(
    wishlist_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    const wishlist = await this.prisma.wishlist.findUniqueOrThrow({
      where: { wishlist_id },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });

    if (
      currentUser.role === UserRole.CUSTOMER &&
      wishlist.user_id !== currentUser.user_id
    ) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xem wishlist của chính mình',
      );
    }

    return wishlist;
  }

  // Cập nhật một mục wishlist
  async update(wishlist_id: number, updateWishlistDto: UpdateWishlistDto) {
    return await this.prisma.wishlist.update({
      where: { wishlist_id },
      data: {
        user_id: updateWishlistDto.user_id,
        game_id: updateWishlistDto.game_id,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Xóa một mục wishlist
  async remove(
    wishlist_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    const wishlist = await this.prisma.wishlist.findUniqueOrThrow({
      where: { wishlist_id },
    });

    if (
      currentUser.role === UserRole.CUSTOMER &&
      wishlist.user_id !== currentUser.user_id
    ) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xóa wishlist của chính mình',
      );
    }

    return await this.prisma.wishlist.delete({
      where: { wishlist_id },
    });
  }

  // Lấy wishlist của một user cụ thể
  async findByUser(
    user_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    if (
      currentUser.role === UserRole.CUSTOMER &&
      currentUser.user_id !== user_id
    ) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xem wishlist của chính mình',
      );
    }

    return await this.prisma.wishlist.findMany({
      where: { user_id },
      include: {
        game: {
          select: {
            game_id: true,
            title: true,
            price: true,
            discount_price: true,
            game_images: {
              select: { image_url: true },
              where: { order_index: 1 },
              take: 1,
            },
          },
        },
      },
    });
  }

  // Xóa game khỏi wishlist của user
  async removeByUserAndGame(
    user_id: number,
    game_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    if (
      currentUser.role === UserRole.CUSTOMER &&
      currentUser.user_id !== user_id
    ) {
      throw new ForbiddenException(
        'Bạn chỉ có thể xóa game khỏi wishlist của chính mình',
      );
    }

    return await this.prisma.wishlist.delete({
      where: {
        user_id_game_id: { user_id, game_id },
      },
    });
  }
}
