import { BadRequestException, ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { EmailService } from '../../email/email.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { UserRole } from '@prisma/client';
import { hashPassword, comparePassword, hashToken } from '../../utils/hash.util';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  private generateToken(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }

  private getTokenExpiry(minutes: number): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  private async findUserByEmailOrUsername(email: string, username?: string) {
    return this.prisma.users.findFirst({
      where: { OR: [{ email }, { username: username ?? undefined }] },
    });
  }

  private async createRefreshToken(userId: number): Promise<string> {
    const token = this.generateToken(32);
    const hashedToken = hashToken(token);

    await this.prisma.refreshTokens.create({
      data: {
        user_id: userId,
        token: hashedToken,
        expires_at: this.getTokenExpiry(7 * 24 * 60), // 7 days
      },
    });
    return token;
  }

  private generateJwtPayload(user: { user_id: number; email: string; role: UserRole }) {
    return { sub: user.user_id, email: user.email, role: user.role };
  }

  private async buildAuthResponse(user: { user_id: number; username: string; email: string; role: UserRole },): Promise<AuthResponseDto> {
    const payload = this.generateJwtPayload(user);
    const access_token = this.jwtService.sign(payload);
    return { access_token, user };
  }

  
  async register(dto: RegisterDto): Promise<{ user: { user_id: number; username: string; email: string; role: UserRole } }> {
    const { username, email, password } = dto;

    const existingUser = await this.findUserByEmailOrUsername(email, username);
    if (existingUser) {
      throw new ConflictException('Username hoặc email đã tồn tại');
    }

    const password_hash = await hashPassword(password);
    const verification_token = this.generateToken(32);

    const user = await this.prisma.users.create({
      data: {
        username,
        email,
        password_hash,
        role: 'CUSTOMER',
        verification_token,
        verification_expires_at: this.getTokenExpiry(24 * 60), // 24 hours
      },
      select: { user_id: true, username: true, email: true, role: true },
    });

    await this.emailService.sendVerificationEmail(email, verification_token);

    return this.buildAuthResponse(user);
  }


  async login(dto: LoginDto): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const { email, password } = dto;

    const user = await this.prisma.users.findUnique({
      where: { email },
      select: {
        user_id: true,
        username: true,
        email: true,
        password_hash: true,
        role: true,
        is_verified: true,
      },
    });

    if (!user || !user.is_verified || !(await comparePassword(password, user.password_hash))) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ hoặc email chưa xác minh');
    }

    // Kiểm tra và tạo giỏ hàng nếu chưa tồn tại
    const existingCart = await this.prisma.cart.findUnique({
      where: { user_id: user.user_id },
    });

    if (!existingCart) {
      await this.prisma.cart.create({
        data: { user_id: user.user_id },
      });
    }

    const auth = await this.buildAuthResponse({
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    const refreshToken = await this.createRefreshToken(user.user_id);

    return { auth, refreshToken };
  }

  async verifyEmail(token: string): Promise<string> {
    const user = await this.prisma.users.findFirst({
      where: {
        verification_token: token,
        verification_expires_at: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Token xác minh không hợp lệ hoặc đã hết hạn');
    }

    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        is_verified: true,
        verification_token: null,
        verification_expires_at: null,
      },
    });

    return 'Email đã được xác minh thành công';
  }

  async requestPasswordReset(email: string): Promise<string> {
    const user = await this.findUserByEmailOrUsername(email);
    if (!user) {
      throw new BadRequestException('Email không tồn tại');
    }

    const reset_token = Math.floor(100000 + Math.random() * 900000).toString();

    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        reset_token,
        reset_expires_at: this.getTokenExpiry(15), // 15 minutes
      },
    });

    return this.emailService.sendPasswordResetEmail(email, reset_token);
  }

  async resetPassword(dto: ResetPasswordDto): Promise<string> {
    const { token, newPassword } = dto;

    const user = await this.prisma.users.findFirst({
      where: {
        reset_token: token,
        reset_expires_at: { gte: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Mã khôi phục không hợp lệ hoặc đã hết hạn');
    }

    const password_hash = await hashPassword(newPassword);

    await this.prisma.users.update({
      where: { user_id: user.user_id },
      data: {
        password_hash,
        reset_token: null,
        reset_expires_at: null,
      },
    });

    return 'Mật khẩu đã được đặt lại thành công';
  }

  async refreshToken(refreshToken: string): Promise<{ auth: AuthResponseDto; refreshToken: string }> {
    const hashed = hashToken(refreshToken);

    const token = await this.prisma.refreshTokens.findFirst({
      where: {
        token: hashed,
        expires_at: { gte: new Date() },
      },
      include: {
        user: {
          select: { user_id: true, username: true, email: true, role: true, is_verified: true },
        },
      },
    });

    if (!token || !token.user.is_verified) {
      throw new UnauthorizedException('Refresh token không hợp lệ hoặc email chưa xác minh');
    }

    const new_refresh_token = this.generateToken(32);
    const hashedNew = hashToken(new_refresh_token);

    await this.prisma.refreshTokens.update({
      where: { id: token.id },
      data: {
        token: hashedNew,
        expires_at: this.getTokenExpiry(7 * 24 * 60), // 7 days
      },
    });

    const auth = await this.buildAuthResponse({
      user_id: token.user.user_id,
      username: token.user.username,
      email: token.user.email,
      role: token.user.role,
    });

    return { auth, refreshToken: new_refresh_token };
  }

  async logout(refreshToken: string): Promise<string> {
    const hashed = hashToken(refreshToken);

    const token = await this.prisma.refreshTokens.findFirst({
      where: { token: hashed },
    });

    if (!token) {
      throw new BadRequestException('Refresh token không hợp lệ');
    }

    await this.prisma.refreshTokens.delete({
      where: { id: token.id },
    });

    return 'Đăng xuất thành công';
  }
}