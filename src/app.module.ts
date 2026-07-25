import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { AvailabilityModule } from './availability/availability.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { AppointmentModule } from './appointment/appointment.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    DoctorModule,
    PatientModule,
    AvailabilityModule,
    SchedulingModule,
    AppointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}