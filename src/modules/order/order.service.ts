import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { UserRole, OrderStatus } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { DiscountType } from '@prisma/client';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  private async getCart(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { user_id: userId },
      include: {
        cart_items: {
          include: {
            game: {
              select: { game_id: true, price: true, discount_price: true },
            },
          },
        },
      },
    });
    if (!cart) throw new NotFoundException('Giỏ hàng không tồn tại');
    return cart;
  }

  private async validatePromotion(promotionCode: string | undefined): Promise<{
    discountValue: Prisma.Decimal;
    discountType: DiscountType;
    minimumOrder: Prisma.Decimal | null;
  } | null> {
    if (!promotionCode) return null;

    const promotion = await this.prisma.promotions.findUnique({
      where: { code: promotionCode },
    });

    if (!promotion) throw new BadRequestException('Mã giảm giá không tồn tại');
    if (!promotion.is_active)
      throw new BadRequestException('Mã giảm giá không hoạt động');
    if (promotion.start_date && new Date() < promotion.start_date)
      throw new BadRequestException('Mã giảm giá chưa bắt đầu');
    if (promotion.end_date && new Date() > promotion.end_date)
      throw new BadRequestException('Mã giảm giá đã hết hạn');

    return {
      discountValue: promotion.discount_value,
      discountType: promotion.discount_type,
      minimumOrder: promotion.minimum_order,
    };
  }

  private calculateDiscountedAmount(
    totalAmount: Prisma.Decimal,
    discountInfo: {
      discountValue: Prisma.Decimal;
      discountType: DiscountType;
      minimumOrder: Prisma.Decimal | null;
    } | null,
  ): Prisma.Decimal {
    if (!discountInfo) return totalAmount;

    const { discountValue, discountType, minimumOrder } = discountInfo;
    if (minimumOrder && totalAmount.lessThan(minimumOrder))
      throw new BadRequestException(
        'Tổng giá không đủ điều kiện áp dụng mã giảm giá',
      );

    switch (discountType) {
      case DiscountType.PERCENTAGE:
        return totalAmount.minus(
          totalAmount.mul(discountValue.div(new Prisma.Decimal('100'))).round(),
        );
      case DiscountType.FIXED_AMOUNT:
        return totalAmount.minus(discountValue);
      default:
        return totalAmount;
    }
  }

  async create(
    createOrderDto: CreateOrderDto,
    currentUser: { user_id: number; role: UserRole },
  ) {
    const cart = await this.getCart(currentUser.user_id);

    const selectedGameIds = createOrderDto.selected_game_ids;
    if (selectedGameIds.length === 0)
      throw new BadRequestException('Vui lòng chọn ít nhất một sản phẩm');

    const selectedCartItems = cart.cart_items.filter((item) =>
      selectedGameIds.includes(item.game.game_id),
    );
    if (selectedCartItems.length !== selectedGameIds.length)
      throw new BadRequestException(
        'Một số sản phẩm được chọn không tồn tại trong giỏ hàng',
      );

    let totalAmount = new Prisma.Decimal('0'); // Khởi tạo với chuỗi '0'
    const orderItemsData = selectedCartItems.map((item) => {
      const unitPrice = item.game.discount_price || item.game.price;
      totalAmount = totalAmount.plus(unitPrice);
      return { order_id: 0, game_id: item.game.game_id };
    });

    const promotion = await this.validatePromotion(
      createOrderDto.promotion_code,
    );
    const discountedAmount = this.calculateDiscountedAmount(
      totalAmount,
      promotion,
    );

    const order = await this.prisma.$transaction(async (prisma) => {
      const newOrder = await prisma.orders.create({
        data: {
          user_id: currentUser.user_id,
          total_amount: totalAmount,
          discounted_amount: discountedAmount.equals(totalAmount)
            ? null
            : discountedAmount,
          status: OrderStatus.DELIVERED,
          notes: createOrderDto.notes,
        },
      });

      const updatedOrderItemsData = orderItemsData.map((item) => ({
        ...item,
        order_id: newOrder.order_id,
      }));
      await prisma.order_Items.createMany({
        data: updatedOrderItemsData,
      });

      await prisma.cart_Items.deleteMany({
        where: { cart_id: cart.cart_id, game_id: { in: selectedGameIds } },
      });

      return newOrder;
    });

    return this.prisma.orders.findUnique({
      where: { order_id: order.order_id },
      include: {
        order_items: {
          include: {
            game: {
              select: { title: true, price: true, discount_price: true },
            },
          },
        },
        user: { select: { username: true } },
      },
    });
  }

  async findAll(currentUser: { user_id: number; role: UserRole }) {
    return currentUser.role === UserRole.ADMIN
      ? this.prisma.orders.findMany({
          include: {
            order_items: {
              include: {
                game: {
                  select: { title: true, price: true, discount_price: true },
                },
              },
            },
            user: { select: { username: true } },
          },
        })
      : this.prisma.orders.findMany({
          where: { user_id: currentUser.user_id },
          include: {
            order_items: {
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
                  },
                },
              },
            },
            user: { select: { username: true } },
          },
        });
  }

  async findOne(
    order_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    const order = await this.prisma.orders.findUnique({
      where: { order_id },
      include: {
        order_items: {
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
              },
            },
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');
    if (
      currentUser.role === UserRole.CUSTOMER &&
      order.user_id !== currentUser.user_id
    )
      throw new ForbiddenException(
        'Bạn chỉ có thể xem đơn hàng của chính mình',
      );

    return order;
  }

  async update(
    order_id: number,
    updateOrderDto: UpdateOrderDto,
    currentUser: { user_id: number; role: UserRole },
  ) {
    if (currentUser.role !== UserRole.ADMIN)
      throw new ForbiddenException('Chỉ admin mới có thể cập nhật đơn hàng');
    const order = await this.prisma.orders.findUnique({ where: { order_id } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    return this.prisma.orders.update({
      where: { order_id },
      data: { notes: updateOrderDto.notes, status: updateOrderDto.status },
      include: {
        order_items: {
          include: {
            game: {
              select: { title: true, price: true, discount_price: true },
            },
          },
        },
        user: { select: { username: true } },
      },
    });
  }

  async remove(
    order_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    if (currentUser.role !== UserRole.ADMIN)
      throw new ForbiddenException('Chỉ admin mới có thể xóa đơn hàng');
    const order = await this.prisma.orders.findUnique({ where: { order_id } });
    if (!order) throw new NotFoundException('Đơn hàng không tồn tại');

    return this.prisma.orders.delete({ where: { order_id } });
  }

  async findAllByUserId(
    user_id: number,
    currentUser: { user_id: number; role: UserRole },
  ) {
    if (currentUser.role !== UserRole.ADMIN)
      throw new ForbiddenException(
        'Chỉ admin mới có thể xem đơn hàng của người dùng khác',
      );
    return this.prisma.orders.findMany({
      where: { user_id },
      include: {
        order_items: {
          include: {
            game: {
              select: { title: true, price: true, discount_price: true },
            },
          },
        },
        user: { select: { username: true } },
      },
    });
  }
}
