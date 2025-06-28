import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Mã khôi phục mật khẩu', example: 'abc123' })
  @IsNotEmpty({ message: 'Mã khôi phục là bắt buộc' })
  @IsString({ message: 'Mã khôi phục phải là chuỗi ký tự' })
  token: string;

  @ApiProperty({ description: 'Mật khẩu mới', example: 'NewPassword123' })
  @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi ký tự' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
  newPassword: string;
}