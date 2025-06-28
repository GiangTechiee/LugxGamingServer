import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthResponseDto {
  @ApiProperty({ description: 'Access token để xác thực' })
  access_token: string;

  @ApiProperty({
    description: 'Thông tin người dùng',
    type: 'object',
    properties: {
      user_id: { type: 'number', description: 'ID của người dùng' },
      username: { type: 'string', description: 'Tên người dùng' },
      email: { type: 'string', description: 'Email của người dùng' },
      role: { type: 'string', enum: Object.values(UserRole), description: 'Vai trò của người dùng' },
    },
  })
  user: {
    user_id: number;
    username: string;
    email: string;
    role: UserRole;
  };
}