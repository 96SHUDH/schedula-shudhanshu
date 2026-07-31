import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
@Injectable()
export class AppointmentService {
  constructor(private prisma: PrismaService) {}

  
  // BOOK APPOINTMENT
async bookAppointment(
    userId: string,
    createAppointmentDto: CreateAppointmentDto,
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

    // Find doctor
    const doctor =
      await this.prisma.doctorProfile.findUnique({
        where: {
          id: createAppointmentDto.doctorId,
        },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor not found',
      );
    }

    // Find doctor's availability
    const availability =
      await this.prisma.recurringAvailability.findFirst({
        where: {
          doctorProfileId: doctor.id,
        },
      });

    if (!availability) {
      throw new NotFoundException(
        'Doctor availability not found',
      );
    }

    // Duplicate booking check
    const existingBooking =
      await this.prisma.appointment.findFirst({
        where: {
          recurringAvailabilityId: availability.id,
          appointmentDate: new Date(
            createAppointmentDto.date,
          ),
          slotStart: createAppointmentDto.startTime,
          slotEnd: createAppointmentDto.endTime,
          status: 'BOOKED',
        },
      });

    if (existingBooking) {
      throw new BadRequestException(
        'This slot is already booked',
      );
    }

    // ============================
    // WAVE Scheduling
    // ============================

    if (availability.schedulingType === 'WAVE') {
      const appointment =
        await this.prisma.appointment.create({
          data: {
            patientProfileId: patient.id,

            recurringAvailabilityId:
              availability.id,

            schedulingType:
              availability.schedulingType,

            appointmentDate: new Date(
              createAppointmentDto.date,
            ),

            slotStart:
              createAppointmentDto.startTime,

            slotEnd:
              createAppointmentDto.endTime,

            status: 'BOOKED',
          },
        });

      return {
        message:
          'Appointment booked successfully',
        appointment,
      };
    }

    // ============================
    // STREAM Scheduling
    // ============================

  if (availability.schedulingType === 'STREAM') {
       // Prevent same patient from booking the same wave twice
  const alreadyBooked =
    await this.prisma.appointment.findFirst({
      where: {
        patientProfileId: patient.id,
        recurringAvailabilityId: availability.id,
        appointmentDate: new Date(createAppointmentDto.date),
        status: 'BOOKED',
      },
    });

  if (alreadyBooked) {
    throw new BadRequestException(
      'You have already booked this STREAM.',
    );
  }

      const totalBookings =
        await this.prisma.appointment.count({
          where: {
            recurringAvailabilityId:
              availability.id,

            appointmentDate: new Date(
              createAppointmentDto.date,
            ),

            status: 'BOOKED',
          },
        });

      if (
        totalBookings >=
        (availability.capacity ?? 0)
      ) {
        throw new BadRequestException(
          'STREAM is full',
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

            appointmentDate: new Date(
              createAppointmentDto.date,
            ),

            tokenNumber,

            status: 'BOOKED',
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
      recurringAvailability: {
        include: {
          doctorProfile: {
            include: {
              user: true,
            },
          },
        },
      },

      customAvailability: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  return {
  message: 'Appointments fetched successfully',

  appointments: appointments.map((appointment) => ({
    id: appointment.id,

    appointmentDate: appointment.appointmentDate,

    status: appointment.status,

    slotStart: appointment.slotStart,

    slotEnd: appointment.slotEnd,

    tokenNumber: appointment.tokenNumber,

    doctor: {
      name:
        appointment.recurringAvailability?.doctorProfile
          ?.fullName,

      specialization:
        appointment.recurringAvailability?.doctorProfile
          ?.specialization,

      email:
        appointment.recurringAvailability?.doctorProfile
          ?.user?.email,
    },
  })),
};
}

// GET DOCTOR APPOINTMENTS

  async getDoctorAppointments(userId: string) {
    // Find doctor profile
    const doctor =
      await this.prisma.doctorProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    // Get all recurring availabilities of doctor
    const availabilities =
      await this.prisma.recurringAvailability.findMany({
        where: {
          doctorProfileId: doctor.id,
        },
        select: {
          id: true,
        },
      });

    const availabilityIds = availabilities.map(
      (item) => item.id,
    );

    const appointments =
      await this.prisma.appointment.findMany({
        where: {
          recurringAvailabilityId: {
            in: availabilityIds,
          },
        },

        include: {
          patientProfile: true,
          recurringAvailability: true,
        },

        orderBy: {
          appointmentDate: 'asc',
        },
      });

    return {
      message: 'Appointments fetched successfully',
      appointments,
    };
  }
  // CANCEL APPOINTMENT
async cancelAppointment(
  userId: string,
  appointmentId: string,
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
  if (appointment.status === 'CANCELLED') {
    throw new BadRequestException(
      'Appointment already cancelled',
    );
  }

  // Past appointment cannot be cancelled
  if (
    appointment.appointmentDate &&
    appointment.appointmentDate < new Date()
  ) {
    throw new BadRequestException(
      'Past appointments cannot be cancelled',
    );
  }

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
    message: 'Appointment cancelled successfully',
    appointment: updatedAppointment,
  };
}
}