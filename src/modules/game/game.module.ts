import { Module } from '@nestjs/common';
import { GamesService } from './game.service';
import { GamesController } from './game.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GamesController],
  providers: [GamesService],
  exports: [GamesService],
})
export class GamesModule {}