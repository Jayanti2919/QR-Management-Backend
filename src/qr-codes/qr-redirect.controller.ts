import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode } from './entities/qr-code.entity';

@Controller('qr')
export class QrRedirectController {
  constructor(
    @InjectRepository(QrCode) private readonly qrCodeRepository: Repository<QrCode>,
  ) {}

  @Get(':dynamicId')
  async redirectToActualUrl(@Param('dynamicId') dynamicId: string, @Res() res: Response) {
    const qrCode = await this.qrCodeRepository.findOne({ where: { dynamicId } });
    if (!qrCode) throw new NotFoundException('QR Code not found');
    return res.redirect(qrCode.url);
  }
}