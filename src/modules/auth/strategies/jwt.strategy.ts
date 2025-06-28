import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload, ValidatedUser } from './jwt-strategy.interface';
import { UserRole } from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common/exceptions';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private prisma: PrismaService) {
    const jwtSecret = config.get<string>('jwt.secret');
  if (!jwtSecret) {
    throw new Error('JWT secret is not defined in environment variables');
  }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<ValidatedUser> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { user_id: payload.sub },
        select: { user_id: true, username: true, email: true, role: true },
      });

      if (!user) {
        throw new UnauthorizedException('Người dùng không tồn tại');
      }

      return {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: user.role as UserRole, 
      };
    } catch (error) {
      throw new UnauthorizedException('Lỗi xác thực: ' + error.message);
    }
  }
}