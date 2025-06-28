import { IsOptional, IsString, IsEmail, MinLength, IsEnum, Matches, IsBoolean, } from 'class-validator';
import { UserRole } from '@prisma/client';

export class UpdateUserByAdminDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password?: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, {
    message: 'Số điện thoại không đúng định dạng Việt Nam',
  })
  phone_number?: string;

  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid UserRole' })
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}