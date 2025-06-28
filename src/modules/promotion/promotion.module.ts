import { Module } from '@nestjs/common';
import { PromotionsService } from './promotion.service';
import { PromotionsController } from './promotion.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [PromotionsController],
  providers: [PromotionsService, PrismaService],
})
export class PromotionsModule {}