import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import { SchedulingService } from './scheduling.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('doctor/schedule')
@UseGuards(JwtAuthGuard)
export class SchedulingController {
  constructor(
    private readonly schedulingService: SchedulingService,
  ) {}

  @Get(':availabilityId')
  generateSchedule(
    @Param('availabilityId')
    availabilityId: string,
  ) {
    return this.schedulingService.generateSchedule(
      availabilityId,
    );
  }
}