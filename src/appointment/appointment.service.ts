import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
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

    const bookingCount =
      await this.prisma.appointment.count({
        where: {
          recurringAvailabilityId: availability.id,
          appointmentDate: new Date(createAppointmentDto.date),
          status: 'BOOKED',
        },
      });

    if (
      bookingCount >=
      (availability.capacity ?? 0)
    ) {

      throw new BadRequestException(
        'Wave is full',
      );

      // Later we'll replace this with
      // next available suggestion.
    }

    const tokenNumber =
      bookingCount + 1;

    const appointmentDateTime = new Date(
    createAppointmentDto.date,
    );

    const [hours, minutes] =
      availability.startTime.split(':').map(Number);

    appointmentDateTime.setHours(
      hours,
      minutes,
      0,
      0,
    );  
    const appointment =
      await this.prisma.appointment.create({
        data: {

          patientProfileId: patient.id,

          recurringAvailabilityId:
            availability.id,

          schedulingType:
            availability.schedulingType,

          appointmentDate:
            appointmentDateTime,

          slotStart:
            createAppointmentDto.startTime,

          slotEnd:
            createAppointmentDto.endTime,

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
      include: {
        recurringAvailability:true,
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

  if (!appointment.appointmentDate) {
    throw new BadRequestException(
      'Appointment date missing',
    );
  }

  const appointmentTime =
    appointment.slotStart ??
    appointment.recurringAvailability?.startTime;
  this.validateThirtyMinuteRule(
    appointment.appointmentDate!,
    appointmentTime,
  );

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
  // RESCHEDULE APPOINTMENT

async rescheduleAppointment(
  userId: string,
  appointmentId: string,
  createAppointmentDto: CreateAppointmentDto,
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

    include:{
        recurringAvailability:true,
    }
  });

  if (!appointment) {
    throw new NotFoundException(
      'Appointment not found',
    );
  }

  // Owner check
  if (
    appointment.patientProfileId !== patient.id
  ) {
    throw new BadRequestException(
      'You are not allowed to reschedule this appointment',
    );
  }

  // Cancelled?
  if (appointment.status === 'CANCELLED') {
    throw new BadRequestException(
      'Cancelled appointment cannot be rescheduled',
    );
  }
  if (!appointment.appointmentDate) {
    throw new BadRequestException(
      'Appointment date missing',
    );
  }

  const appointmentTime =
    appointment.slotStart ??
    appointment.recurringAvailability?.startTime;
  this.validateThirtyMinuteRule(
    appointment.appointmentDate!,
    appointmentTime,
  );
  // Past appointment?
  if (
    appointment.appointmentDate &&
    appointment.appointmentDate < new Date()
  ) {
    throw new BadRequestException(
      'Past appointment cannot be rescheduled',
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

  // Same slot?
  if (
    appointment.recurringAvailabilityId ===
      availability.id &&
    appointment.appointmentDate?.toISOString().split('T')[0] ===
      createAppointmentDto.date &&
    appointment.slotStart ===
      createAppointmentDto.startTime &&
    appointment.slotEnd ===
      createAppointmentDto.endTime
  ) {
    throw new BadRequestException(
      'Cannot reschedule to the same slot',
    );
  }

  // STREAM validation
  if (
    availability.schedulingType === 'STREAM'
  ) {
    const existingBooking =
      await this.prisma.appointment.findFirst({
        where: {
          recurringAvailabilityId:
            availability.id,
          appointmentDate: new Date(
            createAppointmentDto.date,
          ),
          slotStart:
            createAppointmentDto.startTime,
          slotEnd:
            createAppointmentDto.endTime,
          status: 'BOOKED',
          NOT: {
            id: appointment.id,
          },
        },
      });

    if (existingBooking) {
      throw new BadRequestException(
        'Requested slot already booked',
      );
    }
  }

  // WAVE validation
  if (
    availability.schedulingType === 'WAVE'
  ) {
    const bookingCount =
      await this.prisma.appointment.count({
        where: {
          recurringAvailabilityId:
            availability.id,
          appointmentDate: new Date(
            createAppointmentDto.date,
          ),
          status: 'BOOKED',
          NOT: {
            id: appointment.id,
          },
        },
      });

    if (
      bookingCount >=
      (availability.capacity ?? 0)
    ) {
      throw new BadRequestException(
        'Wave is full',
      );
    }
  }

  // Transaction
  const updatedAppointment =
    await this.prisma.$transaction(
      async (tx) => {
        return tx.appointment.update({
          where: {
            id: appointment.id,
          },
          data: {
            recurringAvailabilityId:
              availability.id,

            appointmentDate: new Date(
              createAppointmentDto.date,
            ),

            slotStart:
              createAppointmentDto.startTime,

            slotEnd:
              createAppointmentDto.endTime,

            schedulingType:
              availability.schedulingType,
          },
        });
      },
    );

  return {
    message:
      'Appointment rescheduled successfully',
    appointment: updatedAppointment,
  };
  }
  private validateThirtyMinuteRule(
  appointmentDate: Date,
  startTime?: string,
) {

  if (!startTime) return;

  const appointmentDateTime =
      new Date(appointmentDate);

  const [hour, minute] =
      startTime.split(":").map(Number);

  appointmentDateTime.setHours(
      hour,
      minute,
      0,
      0,
  );

  const now =
      new Date();

  const difference =
      appointmentDateTime.getTime() -
      now.getTime();

  if (
      difference >= 0 &&
      difference < 30 * 60 * 1000
  ) {

      throw new BadRequestException(
        "Appointment cannot be modified within 30 minutes",
      );

  }

}
}