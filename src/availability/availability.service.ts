import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { CreateOverrideDto } from './dto/create-override.dto';

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  // CREATE AVAILABILITY
  async createAvailability(
    userId: string,
    createAvailabilityDto: CreateAvailabilityDto,
  ) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    // Invalid time validation
    if (
      createAvailabilityDto.startTime >=
      createAvailabilityDto.endTime
    ) {
      throw new BadRequestException(
        'Start time must be before end time',
      );
    }

    // Duplicate availability
    const duplicate = await this.prisma.recurringAvailability.findFirst({
      where: {
        doctorProfileId: doctor.id,
        dayOfWeek: createAvailabilityDto.dayOfWeek,
        startTime: createAvailabilityDto.startTime,
        endTime: createAvailabilityDto.endTime,
      },
    });

    if (duplicate) {
      throw new BadRequestException(
        'Availability already exists',
      );
    }

    // Overlapping validation
    const overlapping =
      await this.prisma.recurringAvailability.findFirst({
        where: {
          doctorProfileId: doctor.id,
          dayOfWeek: createAvailabilityDto.dayOfWeek,
          AND: [
            {
              startTime: {
                lt: createAvailabilityDto.endTime,
              },
            },
            {
              endTime: {
                gt: createAvailabilityDto.startTime,
              },
            },
          ],
        },
      });

    if (overlapping) {
      throw new BadRequestException(
        'Time slot overlaps with existing availability',
      );
    }

// WAVE validation (Slot Based)
if (createAvailabilityDto.schedulingType === 'WAVE') {
  if (!createAvailabilityDto.slotDuration) {
    throw new BadRequestException(
      'Slot duration is required for WAVE scheduling',
    );
  }

  if (!createAvailabilityDto.bufferTime) {
    throw new BadRequestException(
      'Buffer time is required for WAVE scheduling',
    );
  }

  if (!createAvailabilityDto.capacity) {
    throw new BadRequestException(
      'Capacity is required for WAVE scheduling',
    );
  }
}

// STREAM validation (Continuous Window)
if (createAvailabilityDto.schedulingType === 'STREAM') {
  if (
    createAvailabilityDto.slotDuration ||
    createAvailabilityDto.bufferTime
  ) {
    throw new BadRequestException(
      'Slot duration and buffer time are not applicable for STREAM scheduling',
    );
  }

  if (!createAvailabilityDto.capacity) {
    throw new BadRequestException(
      'Capacity is required for STREAM scheduling',
    );
  }
}
const availability =
  await this.prisma.recurringAvailability.create({
    data: {
      dayOfWeek: createAvailabilityDto.dayOfWeek,
      startTime: createAvailabilityDto.startTime,
      endTime: createAvailabilityDto.endTime,

      schedulingType: createAvailabilityDto.schedulingType,
      slotDuration: createAvailabilityDto.slotDuration,
      bufferTime: createAvailabilityDto.bufferTime,
      capacity: createAvailabilityDto.capacity,

      doctorProfileId: doctor.id,
    },
  });

    return {
      message: 'Availability created successfully',
      availability,
    };
  }

  // GET ALL AVAILABILITY
  async getAvailability(userId: string) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const availability =
      await this.prisma.recurringAvailability.findMany({
        where: {
          doctorProfileId: doctor.id,
        },
        orderBy: {
          dayOfWeek: 'asc',
        },
      });

    return {
      message: 'Availability fetched successfully',
      availability,
    };
  }

  // UPDATE AVAILABILITY
  async updateAvailability(
    id: string,
    userId: string,
    updateAvailabilityDto: UpdateAvailabilityDto,
  ) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const availability =
      await this.prisma.recurringAvailability.findUnique({
        where: { id },
      });

    if (
      !availability ||
      availability.doctorProfileId !== doctor.id
    ) {
      throw new NotFoundException(
        'Availability not found',
      );
    }

    // Validate time
    if (
      updateAvailabilityDto.startTime &&
      updateAvailabilityDto.endTime &&
      updateAvailabilityDto.startTime >=
        updateAvailabilityDto.endTime
    ) {
      throw new BadRequestException(
        'Start time must be before end time',
      );
    }

    // Overlapping validation
    const overlapping =
      await this.prisma.recurringAvailability.findFirst({
        where: {
          doctorProfileId: doctor.id,
          id: {
            not: id,
          },
          dayOfWeek:
            updateAvailabilityDto.dayOfWeek ??
            availability.dayOfWeek,
          AND: [
            {
              startTime: {
                lt:
                  updateAvailabilityDto.endTime ??
                  availability.endTime,
              },
            },
            {
              endTime: {
                gt:
                  updateAvailabilityDto.startTime ??
                  availability.startTime,
              },
            },
          ],
        },
      });

    if (overlapping) {
      throw new BadRequestException(
        'Time slot overlaps with existing availability',
      );
    }

    const updated =
      await this.prisma.recurringAvailability.update({
        where: {
          id,
        },
        data: updateAvailabilityDto,
      });

    return {
      message: 'Availability updated successfully',
      availability: updated,
    };
  }

  // DELETE AVAILABILITY
  async deleteAvailability(
    id: string,
    userId: string,
  ) {
    const doctor = await this.prisma.doctorProfile.findUnique({
      where: { userId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const availability =
      await this.prisma.recurringAvailability.findUnique({
        where: { id },
      });

    if (
      !availability ||
      availability.doctorProfileId !== doctor.id
    ) {
      throw new NotFoundException(
        'Availability not found',
      );
    }

    await this.prisma.recurringAvailability.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Availability deleted successfully',
    };
    }
    // CREATE CUSTOM OVERRIDE
async createOverride(
  userId: string,
  createOverrideDto: CreateOverrideDto,
) {
  const doctor = await this.prisma.doctorProfile.findUnique({
    where: { userId },
  });

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  // Validate time range
  if (createOverrideDto.startTime >= createOverrideDto.endTime) {
    throw new BadRequestException(
      'Start time must be before end time',
    );
  }

  // Duplicate override check
  const duplicate = await this.prisma.customAvailability.findFirst({
    where: {
      doctorProfileId: doctor.id,
      date: new Date(createOverrideDto.date),
      startTime: createOverrideDto.startTime,
      endTime: createOverrideDto.endTime,
    },
  });

  if (duplicate) {
    throw new BadRequestException(
      'Custom availability already exists',
    );
  }

  // Overlapping override check
  const overlapping =
    await this.prisma.customAvailability.findFirst({
      where: {
        doctorProfileId: doctor.id,
        date: new Date(createOverrideDto.date),
        AND: [
          {
            startTime: {
              lt: createOverrideDto.endTime,
            },
          },
          {
            endTime: {
              gt: createOverrideDto.startTime,
            },
          },
        ],
      },
    });

  if (overlapping) {
    throw new BadRequestException(
      'Time slot overlaps with existing custom availability',
    );
  }

  // STREAM validation
if (createOverrideDto.schedulingType === 'STREAM') {
  if (!createOverrideDto.slotDuration) {
    throw new BadRequestException(
      'Slot duration is required for STREAM scheduling',
    );
  }

  if (createOverrideDto.capacity) {
    throw new BadRequestException(
      'Capacity should not be provided for STREAM scheduling',
    );
  }
}

// WAVE validation
if (createOverrideDto.schedulingType === 'WAVE') {
  if (!createOverrideDto.capacity) {
    throw new BadRequestException(
      'Capacity is required for WAVE scheduling',
    );
  }

  if (
    createOverrideDto.slotDuration ||
    createOverrideDto.bufferTime
  ) {
    throw new BadRequestException(
      'Slot duration and buffer time are not applicable for WAVE scheduling',
    );
  }
}

const availability =
  await this.prisma.customAvailability.create({
    data: {
      date: new Date(createOverrideDto.date),
      startTime: createOverrideDto.startTime,
      endTime: createOverrideDto.endTime,

      schedulingType: createOverrideDto.schedulingType,
      slotDuration: createOverrideDto.slotDuration,
      bufferTime: createOverrideDto.bufferTime,
      capacity: createOverrideDto.capacity,

      doctorProfileId: doctor.id,
    },
  });

  return {
    message: 'Custom availability created successfully',
    availability,
  };
    }
    // GET AVAILABILITY BY DATE
async getAvailabilityByDate(
  userId: string,
  date: string,
) {
  const doctor = await this.prisma.doctorProfile.findUnique({
    where: { userId },
  });

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  const selectedDate = new Date(date);

  if (isNaN(selectedDate.getTime())) {
    throw new BadRequestException('Invalid date');
  }

  // Check custom override first
  const customAvailability =
    await this.prisma.customAvailability.findMany({
      where: {
        doctorProfileId: doctor.id,
        date: selectedDate,
      },
    });

  if (customAvailability.length > 0) {
    return {
      type: 'CUSTOM_OVERRIDE',
      availability: customAvailability,
    };
  }

  // Convert date to day of week
  const dayMap = [
    'SUNDAY',
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
  ];

  const dayOfWeek = dayMap[selectedDate.getDay()];

  const recurringAvailability =
    await this.prisma.recurringAvailability.findMany({
      where: {
        doctorProfileId: doctor.id,
        dayOfWeek: dayOfWeek as any,
      },
    });

  return {
    type: 'RECURRING',
    availability: recurringAvailability,
  };
}
}