import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Controller('doctor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // Create Doctor Profile
  @Post('profile')
  createProfile(
    @Req() req,
    @Body() createDoctorProfileDto: CreateDoctorProfileDto,
  ) {
    return this.doctorService.createProfile(
      req.user.sub,
      createDoctorProfileDto,
    );
  }

  // Get Doctor Profile
  @Get('profile')
  getProfile(@Req() req) {
    return this.doctorService.getProfile(req.user.sub);
  }

  // Update Doctor Profile
  @Patch('profile')
  updateProfile(
    @Req() req,
    @Body() updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    return this.doctorService.updateProfile(
      req.user.sub,
      updateDoctorProfileDto,
    );
  }
}