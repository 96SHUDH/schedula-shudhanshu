import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  // BOOK APPOINTMENT
  async bookAppointment(
    userId: string,
    availabilityId: string,
  ) {
    // Find patient profile
    const patient =
      await this.prisma.patientProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!patient) {
      throw new NotFoundException(
        'Patient profile not found',
      );
    }

    // Find doctor's recurring availability
    const availability =
      await this.prisma.recurringAvailability.findUnique({
        where: {
          id: availabilityId,
        },
      });

    if (!availability) {
      throw new NotFoundException(
        'Availability not found',
      );
    }

    // Duplicate booking check
    const existingBooking =
      await this.prisma.appointment.findFirst({
        where: {
          patientProfileId: patient.id,
          recurringAvailabilityId: availability.id,
        },
      });

    if (existingBooking) {
      throw new BadRequestException(
        'You have already booked this availability',
      );
    }

    // ============================
    // STREAM Scheduling
    // ============================

    if (availability.schedulingType === 'STREAM') {
      const appointment =
        await this.prisma.appointment.create({
          data: {
            patientProfileId: patient.id,
            recurringAvailabilityId: availability.id,

            schedulingType: availability.schedulingType,

            slotStart: availability.startTime,
            slotEnd: availability.endTime,
          },
        });

      return {
        message:
          'Appointment booked successfully',
        appointment,
      };
    }

    // ============================
    // WAVE Scheduling
    // ============================

    if (availability.schedulingType === 'WAVE') {
      const totalBookings =
        await this.prisma.appointment.count({
          where: {
            recurringAvailabilityId:
              availability.id,
          },
        });

      if (
        totalBookings >=
        (availability.capacity ?? 0)
      ) {
        throw new BadRequestException(
          'Wave is full',
        );
      }

      const tokenNumber =
        totalBookings + 1;

      const appointment =
        await this.prisma.appointment.create({
          data: {
            patientProfileId: patient.id,
            recurringAvailabilityId:
              availability.id,

            schedulingType:
              availability.schedulingType,

            tokenNumber,
          },
        });

      return {
        message:
          'Appointment booked successfully',

        tokenNumber,

        appointmentWindow: {
          start: availability.startTime,
          end: availability.endTime,
        },

        appointment,
      };
    }

    throw new BadRequestException(
      'Invalid scheduling type',
    );
    }
    // GET MY APPOINTMENTS
async getMyAppointments(userId: string) {
  const patient = await this.prisma.patientProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!patient) {
    throw new NotFoundException('Patient profile not found');
  }

  const appointments = await this.prisma.appointment.findMany({
    where: {
      patientProfileId: patient.id,
    },
    include: {
      recurringAvailability: true,
      customAvailability: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
    message: 'Appointments fetched successfully',
    appointments,
  };
}

// GET DOCTOR APPOINTMENTS
async getDoctorAppointments(
  userId: string,
  availabilityId: string,
) {
  const doctor = await this.prisma.doctorProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  const availability =
    await this.prisma.recurringAvailability.findUnique({
      where: {
        id: availabilityId,
      },
    });

  if (!availability) {
    throw new NotFoundException('Availability not found');
  }

  if (availability.doctorProfileId !== doctor.id) {
    throw new BadRequestException(
      'You are not authorized to view these appointments',
    );
  }

  const appointments =
    await this.prisma.appointment.findMany({
      where: {
        recurringAvailabilityId: availabilityId,
      },
      include: {
        patientProfile: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

  return {
    message: 'Appointments fetched successfully',
    appointments,
  };
  }
  // ============================
// CANCEL APPOINTMENT
// ============================
async cancelAppointment(
  userId: string,
  appointmentId: string,
) {
  // Find patient
  const patient =
    await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient profile not found',
    );
  }

  // Find appointment
  const appointment =
    await this.prisma.appointment.findUnique({
      where: {
        id: appointmentId,
      },
    });

  if (!appointment) {
    throw new NotFoundException(
      'Appointment not found',
    );
  }

  // Only owner can cancel
  if (
    appointment.patientProfileId !== patient.id
  ) {
    throw new BadRequestException(
      'You are not allowed to cancel this appointment',
    );
  }

  // Already cancelled
  if (
    appointment.status === 'CANCELLED'
  ) {
    throw new BadRequestException(
      'Appointment already cancelled',
    );
  }

  // Cancel appointment
  const updatedAppointment =
    await this.prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: 'CANCELLED',
      },
    });

  return {
    message:
      'Appointment cancelled successfully',
    appointment: updatedAppointment,
  };
}
}