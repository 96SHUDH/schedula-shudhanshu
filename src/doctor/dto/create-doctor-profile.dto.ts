import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDoctorProfileDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsInt()
  experience: number;

  @IsString()
  qualification: string;

  @IsNumber()
  consultationFee: number;

  @IsString()
  availability: string;

  @IsOptional()
  @IsString()
  profileDetails?: string;
}