import { Controller, Get, Post, Body, Query, Res, Req, UseGuards, UseInterceptors, BadRequestException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TransformInterceptor } from '../../common/interceptors/transform.interceptor';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';


@Controller('auth')
@UseInterceptors(TransformInterceptor)
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @ApiOperation({ summary: 'Đăng ký người dùng mới' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async register(@Body() registerDto: RegisterDto): Promise<{ user: { user_id: number; username: string; email: string; role: string } }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Đăng nhập người dùng' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Đăng nhập thành công', type: AuthResponseDto })
  @ApiResponse({ status: 401, description: 'Thông tin đăng nhập không đúng' })
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const { auth, refreshToken } = await this.authService.login(loginDto);
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });
    return auth;
  }

  @Post('verify-email')
  @Public()
  @ApiOperation({ summary: 'Xác minh email qua token (body)' })
  @ApiBody({ schema: { type: 'object', properties: { token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Xác minh email thành công', type: String })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ' })
  async verifyEmail(@Body('token') token: string): Promise<string> {
    if (!token) {
      throw new BadRequestException('Token là bắt buộc');
    }
    return this.authService.verifyEmail(token);
  }

  @Get('verify-email')
  @Public()
  @ApiOperation({ summary: 'Xác minh email qua query token' })
  @ApiQuery({ name: 'token', type: String, description: 'Token xác minh email' })
  @ApiResponse({ status: 200, description: 'Xác minh email thành công' })
  @ApiResponse({ status: 400, description: 'Token không hợp lệ' })
  async verifyEmailByQuery(@Query('token') token: string, @Res() res: Response): Promise<void> {
    if (!token) {
      res.status(400).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Lỗi xác minh</h2>
          <p>Token xác minh không được cung cấp.</p>
        </div>
      `);
      return;
    }

    try {
      const message = await this.authService.verifyEmail(token);
      res.status(200).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Xác minh thành công</h2>
          <p>${message}</p>
          <p>Bạn có thể đóng tab này hoặc đăng nhập vào ứng dụng.</p>
        </div>
      `);
    } catch (error) {
      res.status(400).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2>Lỗi xác minh</h2>
          <p>${error.response?.message || 'Đã xảy ra lỗi khi xác minh email.'}</p>
        </div>
      `);
    }
  }

  @Post('request-password-reset')
  @Public()
  @ApiOperation({ summary: 'Yêu cầu đặt lại mật khẩu' })
  @ApiBody({ schema: { type: 'object', properties: { email: { type: 'string', format: 'email' } } } })
  @ApiResponse({ status: 200, description: 'Yêu cầu đặt lại mật khẩu đã được gửi', type: String })
  @ApiResponse({ status: 400, description: 'Email không hợp lệ' })
  async requestPasswordReset(@Body('email') email: string): Promise<string> {
    if (!email) {
      throw new BadRequestException('Email là bắt buộc');
    }
    return this.authService.requestPasswordReset(email);
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({ summary: 'Đặt lại mật khẩu' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 200, description: 'Đặt lại mật khẩu thành công', type: String })
  @ApiResponse({ status: 400, description: 'Token hoặc mật khẩu không hợp lệ' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<string> {
    return this.authService.resetPassword(dto);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Làm mới access token' })
  @ApiBody({ schema: { type: 'object', properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Làm mới token thành công', type: AuthResponseDto })
  @ApiResponse({ status: 400, description: 'Refresh token không hợp lệ' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<AuthResponseDto> {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token là bắt buộc');
    }

    const { auth, refreshToken: newRefreshToken } = await this.authService.refreshToken(refreshToken);
    
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'strict',
    });
    return auth;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng xuất người dùng' })
  @ApiBody({ schema: { type: 'object', properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Đăng xuất thành công', type: String })
  @ApiResponse({ status: 400, description: 'Refresh token không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Không được phép' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<string> {
    const refreshToken = req.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new BadRequestException('Refresh token là bắt buộc');
    }
    const message = await this.authService.logout(refreshToken);
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    return message;
  }
}