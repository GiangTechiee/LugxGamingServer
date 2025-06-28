import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import appConfig from './config/app.config';
import jwtConfig from './config/jwt.config';
import { validationSchema } from './config/validation.schema';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { EmailModule } from './email/email.module';
import { GenresModule } from './modules/genre/genre.module';
import { GamesModule } from './modules/game/game.module';
import { PlatformsModule } from './modules/platform/platform.module';
import { WishlistModule } from './modules/wishlist/wishlist.module';
import { ReviewsModule } from './modules/review/review.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { PromotionsModule } from './modules/promotion/promotion.module';
import { PaymentsModule } from './modules/payment/payment.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [jwtConfig, appConfig],
      isGlobal: true,
      validationSchema,
      envFilePath: '.env',
    }),
    PrismaModule,
    UserModule,
    AuthModule,
    EmailModule,
    GenresModule,
    GamesModule,
    PlatformsModule,
    WishlistModule,
    ReviewsModule,
    CartModule,
    OrderModule,
    PromotionsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
