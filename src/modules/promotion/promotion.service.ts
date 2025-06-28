import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(private prisma: PrismaService) {}

  async create(createPromotionDto: CreatePromotionDto) {
    return this.prisma.promotions.create({
      data: createPromotionDto,
    });
  }

  async findAll() {
    return this.prisma.promotions.findMany();
  }

  async findOne(id: number) {
    return this.prisma.promotions.findUnique({
      where: { promotion_id: id },
    });
  }

  async update(id: number, updatePromotionDto: UpdatePromotionDto) {
    return this.prisma.promotions.update({
      where: { promotion_id: id },
      data: updatePromotionDto,
    });
  }

  async remove(id: number) {
    return this.prisma.promotions.delete({
      where: { promotion_id: id },
    });
  }

  async checkCode(code: string) {
    const promotion = await this.prisma.promotions.findUnique({
      where: { code },
    });

    if (!promotion) {
      throw new NotFoundException(`Mã giảm giá ${code} không tồn tại`);
    }

    const currentDate = new Date();
    let status = 'INACTIVE';
    let message = '';

    if (!promotion.is_active) {
      status = 'INACTIVE';
      message = 'Mã giảm giá chưa được kích hoạt';
    } else if (promotion.start_date && new Date(promotion.start_date) > currentDate) {
      status = 'NOT_STARTED';
      message = 'Mã giảm giá chưa bắt đầu';
    } else if (promotion.end_date && new Date(promotion.end_date) < currentDate) {
      status = 'EXPIRED';
      message = 'Mã giảm giá đã hết hạn';
    } else {
      status = 'ACTIVE';
      message = 'Mã giảm giá hợp lệ và đang hoạt động';
    }

    return {
      promotion,
      status,
      message,
    };
  }
}