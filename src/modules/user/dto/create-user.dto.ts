import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum, Matches } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  full_name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/, { 
    message: 'Số điện thoại không đúng định dạng' 
  })
  phone_number?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}