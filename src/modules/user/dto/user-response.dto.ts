import { UserRole } from '@prisma/client';

export class UserResponseDto {
  user_id: number;
  username: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
  is_active: boolean;
}