import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';
import { UpdatePatientProfileDto } from './dto/update-patient-profile.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  // Create Patient Profile
  async createProfile(
    userId: string,
    createPatientProfileDto: CreatePatientProfileDto,
  ) {
    // Check if profile already exists
    const existingProfile = await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

    if (existingProfile) {
      throw new BadRequestException('Patient profile already exists');
    }

    // Create profile
    const profile = await this.prisma.patientProfile.create({
      data: {
        ...createPatientProfileDto,
        userId,
      },
    });

    return {
      message: 'Patient profile created successfully',
      profile,
    };
  }

  // Get Patient Profile
  async getProfile(userId: string) {
    const profile = await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new NotFoundException('Patient profile not found');
    }

    return {
      message: 'Patient profile fetched successfully',
      profile,
    };
  }

  // Update Patient Profile
  async updateProfile(
    userId: string,
    updatePatientProfileDto: UpdatePatientProfileDto,
  ) {
    const existingProfile = await this.prisma.patientProfile.findUnique({
      where: {
        userId,
      },
    });

    if (!existingProfile) {
      throw new NotFoundException('Patient profile not found');
    }

    const updatedProfile = await this.prisma.patientProfile.update({
      where: {
        userId,
      },
      data: {
        ...updatePatientProfileDto,
      },
    });

    return {
      message: 'Patient profile updated successfully',
      profile: updatedProfile,
    };
  }
}