import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  UseInterceptors,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createUserDto);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(@GetUser() user: { user_id: number; role: UserRole }): Promise<UserResponseDto[]> {
    // Admin chỉ xem được tất cả customer và chính mình, không xem admin khác
    return this.userService.findAll().then((users) =>
      users.filter(
        (u) => u.role === UserRole.CUSTOMER || u.user_id === user.user_id,
      ),
    );
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async findOne(
    @Param('id') id: string,
    @GetUser() user: { user_id: number; role: UserRole },
  ): Promise<UserResponseDto> {
    const targetUserId = Number(id);

    // Admin có thể xem tất cả customer và chính mình, không xem admin khác
    if (user.role === UserRole.ADMIN) {
      const targetUser = await this.userService.findOne(targetUserId);
      if (
        targetUser.role === UserRole.ADMIN &&
        targetUser.user_id !== user.user_id
      ) {
        throw new ForbiddenException('Bạn không thể xem thông tin của admin khác');
      }
      return targetUser;
    }

    // Customer chỉ xem được chính mình
    if (user.user_id !== targetUserId) {
      throw new ForbiddenException('Bạn chỉ có thể xem hồ sơ của chính mình');
    }

    return this.userService.findOne(targetUserId);
  }

  @Patch('admin/:id')
  @Roles(UserRole.ADMIN)
  async updateByAdmin(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserByAdminDto,
    @GetUser() user: { user_id: number; role: UserRole },
  ): Promise<UserResponseDto> {
    const targetUserId = Number(id);

    // Lấy thông tin user mục tiêu để kiểm tra role
    const targetUser = await this.userService.findOne(targetUserId);

    // Admin không được cập nhật admin khác, chỉ được cập nhật customer hoặc chính mình
    if (
      targetUser.role === UserRole.ADMIN &&
      targetUser.user_id !== user.user_id
    ) {
      throw new ForbiddenException('Bạn không thể cập nhật tài khoản admin khác');
    }

    return this.userService.updateByAdmin(targetUserId, updateUserDto);
  }

  @Patch('customer/:id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  async updateByCustomer(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @GetUser() user: { user_id: number; role: UserRole },
  ): Promise<UserResponseDto> {
    const targetUserId = Number(id);

    // Chỉ cho phép cập nhật thông tin của chính mình
    if (user.user_id !== targetUserId) {
      throw new ForbiddenException('Bạn chỉ có thể cập nhật hồ sơ của chính mình');
    }

    return this.userService.updateByCustomer(targetUserId, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(
    @Param('id') id: string,
    @GetUser() user: { user_id: number; role: UserRole },
  ): Promise<void> {
    const targetUserId = Number(id);

    // Lấy thông tin user mục tiêu để kiểm tra role
    const targetUser = await this.userService.findOne(targetUserId);

    // Admin không được xóa admin khác, chỉ được xóa customer hoặc chính mình
    if (
      targetUser.role === UserRole.ADMIN &&
      targetUser.user_id !== user.user_id
    ) {
      throw new ForbiddenException('Bạn không thể xóa tài khoản admin khác');
    }

    return this.userService.delete(targetUserId);
  }
}