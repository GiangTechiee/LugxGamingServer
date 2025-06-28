import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exeption.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerOptions } from './config/swagger.config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  app.use(cookieParser());

  const allowedOrigins = configService.get<string>('ALLOWED_ORIGINS')?.split(',') || ['http://localhost:3000'];
  
  app.enableCors({
    origin: allowedOrigins, 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], 
    allowedHeaders: ['Content-Type', 'Authorization'], // Các header được phép
    credentials: true, // Cho phép gửi cookie hoặc thông tin xác thực (như HttpOnly Cookie)
  });

  app.useGlobalPipes(new ValidationPipe({
    transform: true, //tự động chuyển kiểu
    whitelist: true, //bỏ qua các thuộc tính không được định nghĩa trong DTO
    forbidNonWhitelisted: true, //nếu có thuộc tính không được định nghĩa trong DTO thì sẽ trả về lỗi
    transformOptions: {
      enableImplicitConversion: true, //cho phép chuyển đổi kiểu dữ liệu tự động
    },
  }))

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor());

  // Thiết lập Swagger
  const document = SwaggerModule.createDocument(app, swaggerOptions);
  SwaggerModule.setup('api', app, document);

  const port = configService.get('app.port') || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger UI is available at: http://localhost:${port}/api`);
}
bootstrap();
