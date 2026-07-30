import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  doctorId: string;

  @IsDateString()
  date: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}