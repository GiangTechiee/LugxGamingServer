import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { UserRole } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  // Thêm review mới
  async create(createReviewDto: CreateReviewDto, currentUser: { user_id: number; role: UserRole }) {
    if (currentUser.role === UserRole.CUSTOMER && currentUser.user_id !== createReviewDto.user_id) {
      throw new ForbiddenException('Bạn chỉ có thể tạo review từ tài khoản của mình');
    }

    // Kiểm tra xem người dùng đã có review cho game này chưa
    const existingReview = await this.prisma.reviews.findUnique({
      where: {
        user_id_game_id: {
          user_id: createReviewDto.user_id,
          game_id: createReviewDto.game_id,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('Bạn đã có một review cho game này. Vui lòng chỉnh sửa review hiện có.');
    }

    return await this.prisma.reviews.create({
      data: {
        user_id: createReviewDto.user_id,
        game_id: createReviewDto.game_id,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Lấy tất cả review (có thể lọc theo game_id, user_id hoặc rating)
  async findAll(
    game_id?: number,
    user_id?: number,
    rating?: number,
  ) {
    // Không giới hạn CUSTOMER khi xem tất cả review
    return await this.prisma.reviews.findMany({
      where: {
        game_id: game_id ? game_id : undefined,
        user_id: user_id ? user_id : undefined,
        rating: rating ? rating : undefined,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Lấy một review theo ID
  async findOne(review_id: number, currentUser: { user_id: number; role: UserRole }) {
    const review = await this.prisma.reviews.findUniqueOrThrow({
      where: { review_id },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });

    if (currentUser.role === UserRole.CUSTOMER && review.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xem review của chính mình để chỉnh sửa hoặc xóa');
    }

    return review;
  }

  // Cập nhật một review
  async update(
    review_id: number,
    updateReviewDto: UpdateReviewDto,
    currentUser: { user_id: number; role: UserRole },
  ) {
    const review = await this.prisma.reviews.findUniqueOrThrow({
      where: { review_id },
    });

    if (currentUser.role === UserRole.CUSTOMER && review.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Bạn chỉ có thể sửa review của chính mình');
    }

    return await this.prisma.reviews.update({
      where: { review_id },
      data: {
        rating: updateReviewDto.rating,
        comment: updateReviewDto.comment,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Xóa một review
  async remove(review_id: number, currentUser: { user_id: number; role: UserRole }) {
    const review = await this.prisma.reviews.findUniqueOrThrow({
      where: { review_id },
    });

    if (currentUser.role === UserRole.CUSTOMER && review.user_id !== currentUser.user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xóa review của chính mình');
    }

    return await this.prisma.reviews.delete({
      where: { review_id },
    });
  }

  // Lấy review theo game
  async findByGame(game_id: number, rating?: number) {
    return await this.prisma.reviews.findMany({
      where: {
        game_id,
        rating: rating ? rating : undefined,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }

  // Lấy review theo user
  async findByUser(user_id: number, currentUser: { user_id: number; role: UserRole }, rating?: number) {
    if (currentUser.role === UserRole.CUSTOMER && currentUser.user_id !== user_id) {
      throw new ForbiddenException('Bạn chỉ có thể xem review của chính mình');
    }

    return await this.prisma.reviews.findMany({
      where: {
        user_id,
        rating: rating ? rating : undefined,
      },
      include: {
        user: { select: { username: true } },
        game: { select: { title: true } },
      },
    });
  }
}