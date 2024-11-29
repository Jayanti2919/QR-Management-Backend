import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUrl, IsNotEmpty, IsIn } from 'class-validator';

export class CreateQrDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['static', 'dynamic'])
  @ApiProperty()
  type: 'static' | 'dynamic';

  @ApiProperty()
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
