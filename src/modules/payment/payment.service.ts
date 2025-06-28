import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, createPaymentDto: CreatePaymentDto) {
    // Kiểm tra đơn hàng có tồn tại và thuộc về người dùng
    const order = await this.prisma.orders.findUnique({
      where: { order_id: createPaymentDto.order_id },
      select: { user_id: true, status: true, total_amount: true, discounted_amount: true },
    });

    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại');
    }

    if (order.user_id !== userId) {
      throw new ForbiddenException('Bạn không có quyền thêm thanh toán cho đơn hàng này');
    }

    if (order.status !== 'DELIVERED') {
      throw new BadRequestException('Đơn hàng không ở trạng thái DELIVERED');
    }

    // Tính expectedAmount: total_amount - discounted_amount (nếu có)
    const expectedAmount = order.discounted_amount
      ? order.total_amount.minus(order.discounted_amount)
      : order.total_amount;

    // Làm tròn xuống cả expectedAmount và createPaymentDto.amount về số nguyên
    const roundedExpectedAmount = expectedAmount.floor();
    const roundedPaymentAmount = new Prisma.Decimal(createPaymentDto.amount).floor();

    // Kiểm tra số tiền thanh toán
    if (!roundedPaymentAmount.equals(roundedExpectedAmount)) {
      throw new BadRequestException(
        `Số tiền thanh toán (${roundedPaymentAmount.toString()}) không khớp với số tiền cần thanh toán (${roundedExpectedAmount.toString()})`,
      );
    }

    const payment = await this.prisma.payments.create({
      data: {
        ...createPaymentDto,
        status: createPaymentDto.status || 'PENDING',
      },
    });

    // Cập nhật trạng thái đơn hàng nếu thanh toán thành công
    if (createPaymentDto.status === 'COMPLETED') {
      await this.prisma.orders.update({
        where: { order_id: createPaymentDto.order_id },
        data: { status: 'PROCESSING' },
      });
    }

    return payment;
  }

  async findAll() {
    return this.prisma.payments.findMany({
      include: { order: true },
    });
  }

  async findOne(id: number) {
    return this.prisma.payments.findUnique({
      where: { payment_id: id },
      include: { order: true },
    });
  }

  async findUserPayments(userId: number) {
    const payments = await this.prisma.payments.findMany({
      where: {
        order: {
          user_id: userId,
        },
      },
      include: { order: true },
    });

    if (!payments.length) {
      throw new ForbiddenException('Không tìm thấy thanh toán nào của bạn');
    }

    return payments;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto) {
    return this.prisma.payments.update({
      where: { payment_id: id },
      data: updatePaymentDto,
    });
  }

  async remove(id: number) {
    return this.prisma.payments.delete({
      where: { payment_id: id },
    });
  }
}