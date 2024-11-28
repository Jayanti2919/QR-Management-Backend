import { Module } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { QrCodeController } from './qr-code.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCode } from './entities/qr-code.entity';
import { QrCodeGenerator } from 'src/common/utils/qr-code-generator';
import { QrRedirectController } from './qr-redirect.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([QrCode]), EventsModule],
  controllers: [QrCodeController, QrRedirectController],
  providers: [QrCodeService, QrCodeGenerator],
})
export class QrCodeModule {}
