import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorProfileDto } from './dto/create-doctor-profile.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Injectable()
export class DoctorService {
  constructor(private prisma: PrismaService) {}

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
}