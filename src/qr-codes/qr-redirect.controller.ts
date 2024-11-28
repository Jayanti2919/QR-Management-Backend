import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Inject,
  Headers,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode } from './entities/qr-code.entity';
import { EventsService } from '../events/events.service';
import { ObjectId } from 'mongodb';
import * as geoip from 'geoip-lite';

@Controller('qr')
export class QrRedirectController {
  constructor(
    @InjectRepository(QrCode)
    private readonly qrCodeRepository: Repository<QrCode>,
    private readonly eventsService: EventsService,
  ) {}

  @Get(':dynamicId')
  async redirectToActualUrl(
    @Param('dynamicId') dynamicId: string,
    @Res() res: Response,
    @Headers('x-forwarded-for') ipHeader: string,
    @Headers('user-agent') userAgent: string,
    @Request() req,
  ) {
    const qrCode = await this.qrCodeRepository.findOne({
      where: { dynamicId },
    });

    if (!qrCode) throw new NotFoundException('QR Code not found');
    // Track the event in the database
    const ip = ipHeader || req.connection.remoteAddress || '127.0.0.1';
    const geo = geoip.lookup(ip);
    const event = {
      qrId: qrCode.dynamicId || qrCode._id.toString(),
      timestamp: new Date(),
      location: geo ? `${geo.city}, ${geo.country}` : 'Unknown',
      device: this.getDeviceType(userAgent),
      platform: this.getPlatform(userAgent),
      ip,
    };
    await this.eventsService.trackEvent(qrCode._id.toString(), event);

    return res.redirect(qrCode.url);
  }

  // Utility to extract device type from User-Agent
  private getDeviceType(userAgent: string): string {
    if (/mobile/i.test(userAgent)) return 'Mobile';
    if (/tablet/i.test(userAgent)) return 'Tablet';
    return 'Desktop';
  }

  // Utility to extract platform from User-Agent
  private getPlatform(userAgent: string): string {
    if (/android/i.test(userAgent)) return 'Android';
    if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
    if (/win/i.test(userAgent)) return 'Windows';
    if (/mac/i.test(userAgent)) return 'MacOS';
    return 'Unknown';
  }
}
