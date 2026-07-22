import {
  IsString,
  IsInt,
  IsOptional,
} from 'class-validator';

export class CreatePatientProfileDto {
  @IsString()
  fullName: string;

  @IsInt()
  age: number;

  @IsString()
  gender: string;

  @IsString()
  contact: string;

  @IsOptional()
  @IsString()
  healthInfo?: string;
}