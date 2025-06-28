import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerOptions = new DocumentBuilder()
  .setTitle('Game Store API')
  .setDescription('API documentation for the Game Store application')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('user', 'User management endpoints')
  .addTag('games', 'Game management endpoints')
  .addTag('genres', 'Genre management endpoints')
  .addTag('platforms', 'Platform management endpoints')
  .addTag('wishlist', 'Wishlist management endpoints')
  .addTag('reviews', 'Review management endpoints')
  .addTag('cart', 'Cart management endpoints')
  .addTag('orders', 'Order management endpoints')
  .addTag('promotions', 'Promotion management endpoints')
  .addTag('payments', 'Payment management endpoints')
  .addBearerAuth() // Hỗ trợ xác thực JWT
  .build();