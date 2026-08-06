import { IsDateString, IsUUID, IsOptional, IsString } from 'class-validator';

export class RescheduleAppointmentDto {
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