import {
  IsDateString,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateOverrideDto {
  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;
}