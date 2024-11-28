import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  location: string;

  @IsString()
  @IsNotEmpty()
  device: string;

  @IsString()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @IsNotEmpty()
  ip: string;
}
