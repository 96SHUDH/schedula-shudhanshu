import {
  Body,
  Query,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AvailabilityService } from './availability.service';

import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateOverrideDto } from './dto/create-override.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('doctor/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  // ===========================
  // Recurring Availability APIs
  // ===========================

  // Create recurring availability
  @Post()
  createAvailability(
    @Req() req,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ) {
    return this.availabilityService.createAvailability(
      req.user.sub,
      createAvailabilityDto,
    );
  }

  // Get all recurring availability
  @Get()
  getAvailability(@Req() req) {
    return this.availabilityService.getAvailability(
      req.user.sub,
    );
  }

  // Update recurring availability
  @Patch(':id')
  updateAvailability(
    @Param('id') id: string,
    @Req() req,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    return this.availabilityService.updateAvailability(
      id,
      req.user.sub,
      updateAvailabilityDto,
    );
  }

  // Delete recurring availability
  @Delete(':id')
  deleteAvailability(
    @Param('id') id: string,
    @Req() req,
  ) {
    return this.availabilityService.deleteAvailability(
      id,
      req.user.sub,
    );
  }

  // ===========================
  // Custom Override APIs
  // ===========================

  // Create custom override
  @Post('override')
  createOverride(
    @Req() req,
    @Body() createOverrideDto: CreateOverrideDto,
  ) {
    return this.availabilityService.createOverride(
      req.user.sub,
      createOverrideDto,
    );
  }

  // Get availability by date
  @Get('date')
  getAvailabilityByDate(
    @Req() req,
    @Query('date') date: string,
  ) {
    return this.availabilityService.getAvailabilityByDate(
      req.user.sub,
      date,
    );
  }
}