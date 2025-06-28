import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Email của người dùng', example: 'user@example.com' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @ApiProperty({ description: 'Mật khẩu của người dùng', example: 'Password123' })
  @IsNotEmpty({ message: 'Mật khẩu là bắt buộc' })
  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự' })
  password: string;
}