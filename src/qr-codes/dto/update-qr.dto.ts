import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateQrDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty()
  newUrl: string;
}
