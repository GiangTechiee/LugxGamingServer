import { Module } from '@nestjs/common';
import { PlatformsService } from './platform.service';
import { PlatformsController } from './platform.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlatformsController],
  providers: [PlatformsService],
  exports: [PlatformsService],
})
export class PlatformsModule {}