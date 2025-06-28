import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ReviewsService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';
import { Public } from 'src/common/decorators/public.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() createReviewDto: CreateReviewDto, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.reviewsService.create(createReviewDto, user);
  }

  @Get()
  @Public()
  findAll(
    @Query('game_id', ParseIntPipe) game_id?: number,
    @Query('user_id', ParseIntPipe) user_id?: number,
    @Query('rating', ParseIntPipe) rating?: number,
  ) {
    return this.reviewsService.findAll(game_id, user_id, rating);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.reviewsService.findOne(id, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @GetUser() user: { user_id: number; role: UserRole },
  ) {
    return this.reviewsService.update(id, updateReviewDto, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  delete(@Param('id', ParseIntPipe) id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.reviewsService.remove(id, user);
  }

  @Get('game/:game_id')
  @Public()
  findByGame(@Param('game_id', ParseIntPipe) game_id: number, @Query('rating', ParseIntPipe) rating?: number) {
    return this.reviewsService.findByGame(game_id, rating);
  }

  @Get('user/:user_id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  findByUser(
    @Param('user_id', ParseIntPipe) user_id: number,
    @GetUser() user: { user_id: number; role: UserRole },
    @Query('rating', ParseIntPipe) rating?: number,
  ) {
    return this.reviewsService.findByUser(user_id, user, rating);
  }
}