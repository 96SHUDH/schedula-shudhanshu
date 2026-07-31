import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  // Book Appointment
  @Post()
  @Roles('PATIENT')
  bookAppointment(
    @Req() req,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ) {
    return this.appointmentService.bookAppointment(
      req.user.sub,
      createAppointmentDto,
    );
  }

  // Patient Appointments
  @Get('my')
  @Roles('PATIENT')
  getMyAppointments(@Req() req) {
    return this.appointmentService.getMyAppointments(req.user.sub);
  }

  // Doctor Appointments
  @Get('doctor')
  @Roles('DOCTOR')
  getDoctorAppointments(@Req() req) {
    return this.appointmentService.getDoctorAppointments(req.user.sub);
  }

  // Cancel Appointment
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