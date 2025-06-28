import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, Query, UseInterceptors, UseGuards } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { TransformInterceptor } from 'src/common/interceptors/transform.interceptor';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';


@Controller('wishlist')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.wishlistService.create(createWishlistDto, user);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@Query('user_id', ParseIntPipe) user_id?: number, @GetUser() user?: { user_id: number; role: UserRole }) {
    return this.wishlistService.findAll(user_id, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.wishlistService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() updateWishlistDto: UpdateWishlistDto) {
    return this.wishlistService.update(id, updateWishlistDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.wishlistService.remove(id, user);
  }

  @Get('user/:user_id')
  findByUser(@Param('user_id', ParseIntPipe) user_id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.wishlistService.findByUser(user_id, user);
  }

  @Delete('user/:user_id/game/:game_id')
  removeByUserAndGame(
    @Param('user_id', ParseIntPipe) user_id: number,
    @Param('game_id', ParseIntPipe) game_id: number,
    @GetUser() user: { user_id: number; role: UserRole }
  ) {
    return this.wishlistService.removeByUserAndGame(user_id, game_id, user);
  }
}