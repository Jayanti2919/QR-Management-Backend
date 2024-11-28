import { Module } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { QrCodeController } from './qr-code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from './entities/qr-code.entity';
import { QrCodeGenerator } from 'src/common/utils/qr-code-generator';

@Module({
  imports: [TypeOrmModule.forFeature([QrCode])],
  controllers: [QrCodeController],
  providers: [QrCodeService, QrCodeGenerator],
})
export class QrCodeModule {}
