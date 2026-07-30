import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';

import { DayOfWeek, SchedulingType } from '@prisma/client';

export class CreateAvailabilityDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsEnum(SchedulingType)
  schedulingType: SchedulingType;

  @IsOptional()
  @IsInt()
  @Min(1)
  slotDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  bufferTime?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}