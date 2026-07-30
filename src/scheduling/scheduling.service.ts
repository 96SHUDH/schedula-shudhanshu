import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulingService {
  constructor(private prisma: PrismaService) {}

  async generateSchedule(availabilityId: string) {
    const availability =
      await this.prisma.recurringAvailability.findUnique({
        where: {
          id: availabilityId,
        },
      });

    if (!availability) {
      return {
        message: 'Availability not found',
      };
    }

    // STREAM Scheduling
    if (availability.schedulingType === 'STREAM') {
      const slots: {
      start: string;
      end: string;
    }[] = [];

      const slotDuration = availability.slotDuration ?? 15;
      const bufferTime = availability.bufferTime ?? 0;

      const start = availability.startTime.split(':').map(Number);
      const end = availability.endTime.split(':').map(Number);

      let currentMinutes = start[0] * 60 + start[1];
      const endMinutes = end[0] * 60 + end[1];

      while (currentMinutes + slotDuration <= endMinutes) {
        const slotStart = currentMinutes;
        const slotEnd = currentMinutes + slotDuration;

        const startHour = Math.floor(slotStart / 60);
        const startMinute = slotStart % 60;

        const endHour = Math.floor(slotEnd / 60);
        const endMinute = slotEnd % 60;

        slots.push({
          start: `${String(startHour).padStart(2, '0')}:${String(
            startMinute,
          ).padStart(2, '0')}`,
          end: `${String(endHour).padStart(2, '0')}:${String(
            endMinute,
          ).padStart(2, '0')}`,
        });

        currentMinutes = slotEnd + bufferTime;
      }

      return {
        schedulingType: 'STREAM',
        slots,
      };
    }

    // WAVE Scheduling
    if (availability.schedulingType === 'WAVE') {
      return {
        schedulingType: 'WAVE',
        window: {
          start: availability.startTime,
          end: availability.endTime,
        },
        capacity: availability.capacity,
        available: availability.capacity,
      };
    }

    // Invalid scheduling type
    return {
      message: 'Invalid scheduling type',
    };
  }
}
