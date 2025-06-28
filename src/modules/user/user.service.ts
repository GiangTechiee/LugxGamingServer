import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { hashPassword } from '../../utils/hash.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly userSelect = {
    user_id: true,
    username: true,
    email: true,
    full_name: true,
    phone_number: true,
    role: true,
    created_at: true,
    updated_at: true,
    is_active: true,
  } as const;

  private async checkUserExists(id: number): Promise<void> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      select: { user_id: true },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private async checkUniqueConstraints(
    username?: string,
    email?: string,
    excludeId?: number,
  ): Promise<void> {
    if (!username && !email) return;

    const orConditions: Array<{ username?: string; email?: string }> = [];
    if (username) orConditions.push({ username });
    if (email) orConditions.push({ email });

    const whereCondition: Prisma.UsersWhereInput = {
      OR: orConditions,
      ...(excludeId && { user_id: { not: excludeId } }),
    };

    const existingUser = await this.prisma.users.findFirst({
      where: whereCondition,
      select: { username: true, email: true },
    });

    if (existingUser) {
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
    }
  }

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { username, email, password, phone_number, ...rest } = createUserDto;

    await this.checkUniqueConstraints(username, email);

    const passwordHash = await hashPassword(password);

    return this.prisma.users.create({
      data: {
        username,
        email,
        password_hash: passwordHash,
        phone_number,
        ...rest,
      },
      select: this.userSelect,
    });
  }

  async findAll(): Promise<UserResponseDto[]> {
    return this.prisma.users.findMany({
      select: this.userSelect,
    });
  }

  async findOne(id: number): Promise<UserResponseDto> {
    if (!id || isNaN(id)) {
      throw new BadRequestException('Invalid user ID');
    }
    const user = await this.prisma.users.findUnique({
      where: { user_id: id },
      select: this.userSelect,
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateByCustomer(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    await this.checkUserExists(id);

    const { password, phone_number, email, full_name } = updateUserDto;

    if (email) {
      await this.checkUniqueConstraints(undefined, email, id);
    }

    const data: Prisma.UsersUpdateInput = {};

    if (password) {
      data.password_hash = await hashPassword(password);
    }
    if (email) {
      data.email = email;
    }
    if (phone_number) {
      data.phone_number = phone_number;
    }
    if (full_name) {
      data.full_name = full_name;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('No valid fields to update');
    }

    return this.prisma.users.update({
      where: { user_id: id },
      data,
      select: this.userSelect,
    });
  }

  async updateByAdmin(
    id: number,
    updateUserDto: UpdateUserByAdminDto,
  ): Promise<UserResponseDto> {
    await this.checkUserExists(id);

    const { password, phone_number, email, username, ...rest } = updateUserDto;

    await this.checkUniqueConstraints(username, email, id);

    const data: Prisma.UsersUpdateInput = { ...rest };

    if (password) {
      data.password_hash = await hashPassword(password);
    }
    if (email) {
      data.email = email;
    }
    if (phone_number) {
      data.phone_number = phone_number;
    }
    if (username) {
      data.username = username;
    }

    return this.prisma.users.update({
      where: { user_id: id },
      data,
      select: this.userSelect,
    });
  }

  async delete(id: number): Promise<void> {
    await this.checkUserExists(id);
    await this.prisma.users.delete({ where: { user_id: id } });
  }
}