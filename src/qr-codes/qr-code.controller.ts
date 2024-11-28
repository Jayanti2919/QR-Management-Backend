import { Controller, Post, Body, UseGuards, Request, Put, Param, Get } from '@nestjs/common';
import { QrCodeService } from './qr-code.service';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ObjectId } from 'mongodb';

@Controller('qr')
@UseGuards(JwtAuthGuard)
export class QrCodeController {
  constructor(private readonly qrCodeService: QrCodeService) {}

  @Post('create-qr')
  async createDynamicQr(@Request() req, @Body() dto: CreateQrDto) {
    return this.qrCodeService.createQrCode(req.user.id, dto);
  }

  @Put(':id/update')
  async updateDynamicQr(@Request() req, @Param('id') id: string, @Body() dto: UpdateQrDto) {
    const newId = new ObjectId(id);
    return this.qrCodeService.updateDynamicQr(req.user.id, newId, dto);
  }

  @Get('my-codes')
  async getMyQrCodes(@Request() req) {
    return this.qrCodeService.getUserQrCodes(req.user.id);
  }
}
