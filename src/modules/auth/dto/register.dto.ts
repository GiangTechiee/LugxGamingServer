import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Tên người dùng', example: 'john_doe' })
  @IsNotEmpty({ message: 'Username là bắt buộc' })
  @IsString({ message: 'Username phải là chuỗi ký tự' })
  username: string;

  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng', example: 'Password123' })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
  password: string;
}