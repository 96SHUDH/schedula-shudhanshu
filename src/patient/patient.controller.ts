import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@Controller('patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PATIENT')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // Create Patient Profile
  @Post('profile')
  createProfile(
    @Req() req,
    @Body() createPatientProfileDto: CreatePatientProfileDto,
  ) {
    return this.patientService.createProfile(
      req.user.sub,
      createPatientProfileDto,
    );
  }

  // Get Patient Profile
  @Get('profile')
  getProfile(@Req() req) {
    return this.patientService.getProfile(req.user.sub);
  }

  // Update Patient Profile
  @Patch('profile')
  updateProfile(
    @Req() req,
    @Body() updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    return this.patientService.updateProfile(
      req.user.sub,
      updatePatientProfileDto,
    );
  }
}