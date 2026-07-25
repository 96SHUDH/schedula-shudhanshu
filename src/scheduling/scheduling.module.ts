import { Module } from '@nestjs/common';

import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';

import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SchedulingController],
  providers: [SchedulingService],
})
export class SchedulingModule {}