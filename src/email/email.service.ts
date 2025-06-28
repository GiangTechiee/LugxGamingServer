import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_APP_PASSWORD'),
      },
      logger: true,
      debug: true,
    });
  }

  async sendVerificationEmail(email: string, token: string): Promise<string> {
    const isDev = this.configService.get<string>('NODE_ENV') === 'development';
    const baseUrl = isDev
      ? this.configService.get<string>('BACKEND_URL')
      : this.configService.get<string>('FRONTEND_URL');
    const path = isDev ? '/auth/verify-email' : '/verify-email';
    const verificationUrl = `${baseUrl}${path}?token=${token}`;

    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'Xác minh địa chỉ email của bạn',
      text: isDev
        ? `Vui lòng xác minh email của bạn bằng liên kết: ${verificationUrl}`
        : undefined,
      html: isDev
        ? undefined
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Xác minh email</h2>
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đăng ký! Vui lòng nhấp vào nút dưới đây để xác minh địa chỉ email của bạn:</p>
            <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Xác minh email</a>
            <p>Nếu nút không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>Liên kết này sẽ hết hạn sau 24 giờ.</p>
            <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
          </div>
        `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return isDev ? `Email xác minh đã gửi: ${verificationUrl}` : 'Email xác minh đã được gửi';
    } catch (error) {
      throw new InternalServerErrorException(`Không thể gửi email xác minh: ${error.message}`);
    }
  }

  async sendPasswordResetEmail(email: string, code: string): Promise<string> {
    const isDev = this.configService.get<string>('NODE_ENV') === 'development';

    const mailOptions = {
      from: this.configService.get<string>('GMAIL_USER'),
      to: email,
      subject: 'Khôi phục mật khẩu của bạn',
      text: isDev ? `Mã khôi phục mật khẩu của bạn là: ${code}` : undefined,
      html: isDev
        ? undefined
        : `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2>Khôi phục mật khẩu</h2>
            <p>Xin chào,</p>
            <p>Bạn đã yêu cầu khôi phục mật khẩu. Dùng mã dưới đây để đặt lại mật khẩu của bạn:</p>
            <h3 style="color: #4CAF50;">${code}</h3>
            <p>Mã này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
            <p>Trân trọng,<br>Đội ngũ hỗ trợ</p>
          </div>
        `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return isDev ? `Mã khôi phục: ${code}` : 'Mã khôi phục đã được gửi đến email của bạn';
    } catch (error) {
      throw new InternalServerErrorException(`Không thể gửi email khôi phục mật khẩu: ${error.message}`);
    }
  }
}