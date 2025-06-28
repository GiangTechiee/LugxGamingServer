import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  findOne(@GetUser() user: { user_id: number; role: UserRole }) {
    return this.cartService.findOne(user.user_id, user);
  }

  @Get('items')
  findItems(@GetUser() user: { user_id: number; role: UserRole }) {
    return this.cartService.findItems(user.user_id, user);
  }

  @Post('items')
  addItem(@Body() createCartItemDto: CreateCartItemDto, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.cartService.addItem(createCartItemDto, user);
  }

  @Patch('items/:cart_item_id')
  updateItem(
    @Param('cart_item_id', ParseIntPipe) cart_item_id: number,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @GetUser() user: { user_id: number; role: UserRole },
  ) {
    return this.cartService.updateItem(cart_item_id, updateCartItemDto, user);
  }

  @Delete('items/:cart_item_id')
  removeItem(@Param('cart_item_id', ParseIntPipe) cart_item_id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.cartService.removeItem(cart_item_id, user);
  }

  @Delete()
  removeCart(@GetUser() user: { user_id: number; role: UserRole }) {
    return this.cartService.removeCart(user.user_id, user);
  }

  // Endpoint cho ADMIN để xem giỏ hàng của người dùng khác
  @Get(':user_id')
  @Roles(UserRole.ADMIN)
  findOneByUserId(@Param('user_id', ParseIntPipe) user_id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.cartService.findOne(user_id, user);
  }
}