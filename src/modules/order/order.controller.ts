import { Controller, Get, Post, Patch, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.orderService.create(createOrderDto, user);
  }

  @Get()
  findAll(@GetUser() user: { user_id: number; role: UserRole }) {
    return this.orderService.findAll(user);
  }

  @Get(':order_id')
  findOne(@Param('order_id', ParseIntPipe) order_id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.orderService.findOne(order_id, user);
  }

  @Patch(':order_id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('order_id', ParseIntPipe) order_id: number,
    @Body() updateOrderDto: UpdateOrderDto,
    @GetUser() user: { user_id: number; role: UserRole },
  ) {
    return this.orderService.update(order_id, updateOrderDto, user);
  }

  @Delete(':order_id')
  @Roles(UserRole.ADMIN)
  remove(@Param('order_id', ParseIntPipe) order_id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.orderService.remove(order_id, user);
  }

  @Get('user/:user_id')
  @Roles(UserRole.ADMIN)
  findAllByUserId(@Param('user_id', ParseIntPipe) user_id: number, @GetUser() user: { user_id: number; role: UserRole }) {
    return this.orderService.findAllByUserId(user_id, user);
  }
}