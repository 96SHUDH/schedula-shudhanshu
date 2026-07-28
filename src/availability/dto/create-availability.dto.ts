import {
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';

import { DayOfWeek } from '@prisma/client';

export class CreateAvailabilityDto {
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}