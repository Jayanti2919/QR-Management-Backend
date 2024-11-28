import { IsString, IsUrl, IsNotEmpty } from 'class-validator';

export class UpdateQrDto {
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  newUrl: string;
}
