import { IsString, IsUrl, IsNotEmpty, IsIn } from 'class-validator';

export class CreateQrDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['static', 'dynamic'])
  type: 'static' | 'dynamic';

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
