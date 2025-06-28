import { Injectable, ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  // Lấy giỏ hàng
  async findOne(user_id: number, currentUser: { user_id: number; role: UserRole }) {
    if (currentUser.role === UserRole.CUSTOMER && currentUser.user_id !== user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xem giỏ hàng của chính mình');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { user_id },
      include: {
        cart_items: {
          include: {
            game: { select: { title: true, price: true } },
          },
        },
        user: { select: { username: true } },
      },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    return cart;
  }

  // Thêm mục vào giỏ hàng
  async addItem(createCartItemDto: CreateCartItemDto, currentUser: { user_id: number; role: UserRole }) {
    // Lấy giỏ hàng
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: currentUser.user_id },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    // Kiểm tra xem game đã có trong giỏ hàng chưa
    const existingItem = await this.prisma.cart_Items.findUnique({
      where: {
        cart_id_game_id: {
          cart_id: cart.cart_id,
          game_id: createCartItemDto.game_id,
        },
      },
    });

    if (existingItem) {
      throw new ConflictException('Game này đã có trong giỏ hàng');
    }

    // Kiểm tra xem game có tồn tại không
    const game = await this.prisma.games.findUnique({
      where: { game_id: createCartItemDto.game_id },
    });

    if (!game) {
      throw new NotFoundException('Game không tồn tại');
    }

    return await this.prisma.cart_Items.create({
      data: {
        cart_id: cart.cart_id,
        game_id: createCartItemDto.game_id,
      },
      include: {
        game: { select: { title: true, price: true } },
      },
    });
  }

  // Lấy danh sách mục trong giỏ hàng
  async findItems(user_id: number, currentUser: { user_id: number; role: UserRole }) {
    if (currentUser.role === UserRole.CUSTOMER && currentUser.user_id !== user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xem mục trong giỏ hàng của chính mình');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { user_id },
      include: {
        cart_items: {
          include: {
            game: { 
              select: { 
                title: true, 
                price: true,
                discount_price: true,
                game_images: {
                  select: { image_url: true },
                  where: { order_index: 1 },
                  take: 1,
                },
              } 
            },
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    return cart.cart_items;
  }

  // Cập nhật mục trong giỏ hàng
  async updateItem(
    cart_item_id: number,
    updateCartItemDto: UpdateCartItemDto,
    currentUser: { user_id: number; role: UserRole },
  ) {
    const cartItem = await this.prisma.cart_Items.findUniqueOrThrow({
      where: { cart_item_id },
      include: { cart: true },
    });

    if (currentUser.role === UserRole.CUSTOMER && cartItem.cart.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật mục trong giỏ hàng của chính mình');
    }

    if (updateCartItemDto.game_id) {
      // Kiểm tra xem game mới đã có trong giỏ hàng chưa
      const existingItem = await this.prisma.cart_Items.findUnique({
        where: {
          cart_id_game_id: {
            cart_id: cartItem.cart_id,
            game_id: updateCartItemDto.game_id,
          },
        },
      });

      if (existingItem && existingItem.cart_item_id !== cart_item_id) {
        throw new ConflictException('Game này đã có trong giỏ hàng');
      }

      // Kiểm tra xem game có tồn tại không
      const game = await this.prisma.games.findUnique({
        where: { game_id: updateCartItemDto.game_id },
      });

      if (!game) {
        throw new NotFoundException('Game không tồn tại');
      }
    }

    return await this.prisma.cart_Items.update({
      where: { cart_item_id },
      data: {
        game_id: updateCartItemDto.game_id,
      },
      include: {
        game: { select: { title: true, price: true } },
      },
    });
  }

  // Xóa mục khỏi giỏ hàng
  async removeItem(cart_item_id: number, currentUser: { user_id: number; role: UserRole }) {
    const cartItem = await this.prisma.cart_Items.findUniqueOrThrow({
      where: { cart_item_id },
      include: { cart: true },
    });

    if (currentUser.role === UserRole.CUSTOMER && cartItem.cart.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xóa mục trong giỏ hàng của chính mình');
    }

    return await this.prisma.cart_Items.delete({
      where: { cart_item_id },
    });
  }

  // Xóa giỏ hàng
  // Xóa tất cả mục trong giỏ hàng
  async removeCart(user_id: number, currentUser: { user_id: number; role: UserRole }) {
    if (currentUser.role === UserRole.CUSTOMER && currentUser.user_id !== user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xóa các mục trong giỏ hàng của chính mình');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { user_id },
    });

    if (!cart) {
      throw new NotFoundException('Giỏ hàng không tồn tại');
    }

    // Xóa tất cả cart_items trong giỏ hàng
    await this.prisma.cart_Items.deleteMany({
      where: { cart_id: cart.cart_id },
    });

    return { message: 'Đã xóa tất cả mục trong giỏ hàng' };
  }
}