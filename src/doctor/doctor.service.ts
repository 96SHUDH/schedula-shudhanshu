import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { SchedulingService } from '../scheduling/scheduling.service';
@Injectable()
export class DoctorService {
  constructor(
  private prisma: PrismaService,
  private schedulingService: SchedulingService,
) {}

  // Create Doctor Profile
  async createProfile(
    userId: string,
    createDoctorProfileDto: CreateDoctorProfileDto,
  ) {
    // Check if profile already exists
    const existingProfile = await this.prisma.doctorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw new BadRequestException('Doctor profile already exists');
    }

    // Create profile
    const profile = await this.prisma.doctorProfile.create({
      data: {
        ...createDoctorProfileDto,
        userId,
      },
    });

    return {
      message: 'Doctor profile created successfully',
      profile,
    };
  }

  // Get Doctor Profile
  async getProfile(userId: string) {
    const profile = await this.prisma.doctorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Doctor profile not found');
    }

    return {
      message: 'Doctor profile fetched successfully',
      profile,
    };
  }

  // Update Doctor Profile
  async updateProfile(
    userId: string,
    updateDoctorProfileDto: UpdateDoctorProfileDto,
  ) {
    const existingProfile = await this.prisma.doctorProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!existingProfile) {
      throw new NotFoundException('Doctor profile not found');
    }

    const updatedProfile = await this.prisma.doctorProfile.update({
      where: {
        userId,
      },
      data: {
        ...updateDoctorProfileDto,
      },
    });

    return {
      message: 'Doctor profile updated successfully',
      profile: updatedProfile,
    };
  }
  // Get Doctor Slots
async getDoctorSlots(
  doctorId: string,
  date: string,
) {
  const doctor = await this.prisma.doctorProfile.findUnique({
    where: {
      id: doctorId,
    },
  });

  if (!doctor) {
    throw new NotFoundException('Doctor not found');
  }

  const selectedDate = new Date(date);

  if (isNaN(selectedDate.getTime())) {
    throw new BadRequestException('Invalid date');
  }

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

  const availability =
    await this.prisma.recurringAvailability.findFirst({
      where: {
        doctorProfileId: doctor.id,
        dayOfWeek: dayOfWeek as any,
      },
    });

  if (!availability) {
    throw new NotFoundException(
      'No availability found for this date',
    );
  }

  return this.schedulingService.generateSchedule(
    availability.id,
  );
  }
}
