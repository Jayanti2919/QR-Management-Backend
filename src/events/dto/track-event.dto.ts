import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, isString } from 'class-validator';

export class TrackEventDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  location: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  device: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  platform: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  ip: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  url: string;
}
