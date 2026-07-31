import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AppointmentService } from './appointment.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  // ============================
  // Patient books an appointment
  // ============================
  @Post('book/:availabilityId')
  @Roles('PATIENT')
  bookAppointment(
    @Param('availabilityId') availabilityId: string,
    @Req() req,
  ) {
    return this.appointmentService.bookAppointment(
      req.user.sub,
      availabilityId,
    );
  }

  // ============================
  // Patient can view appointments
  // ============================
  @Get('my')
  @Roles('PATIENT')
  getMyAppointments(@Req() req) {
    return this.appointmentService.getMyAppointments(
      req.user.sub,
    );
  }

  // ============================
  // Doctor can view appointments
  // ============================
  @Get('doctor/:availabilityId')
  @Roles('DOCTOR')
  getDoctorAppointments(
    @Param('availabilityId') availabilityId: string,
    @Req() req,
  ) {
    return this.appointmentService.getDoctorAppointments(
      req.user.sub,
      availabilityId,
    );
  }

  // ============================
  // Patient cancels appointment
  // ============================
  @Patch(':id/cancel')
  @Roles('PATIENT')
  cancelAppointment(
    @Param('id') appointmentId: string,
    @Req() req,
  ) {
    return this.appointmentService.cancelAppointment(
      req.user.sub,
      appointmentId,
    );
  }
}