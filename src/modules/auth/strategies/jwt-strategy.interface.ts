import { UserRole } from "@prisma/client";

export interface JwtPayload {
  sub: number; // user_id
  username?: string;
  email?: string;
  role?: UserRole;
  iat?: number; // issued at
  exp?: number; // expiration
}

export interface ValidatedUser {
  user_id: number;
  username: string;
  email: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user: ValidatedUser;
}