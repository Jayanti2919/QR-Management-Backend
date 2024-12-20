import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QrCode } from './entities/qr-code.entity';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { ObjectId } from 'mongodb';
import { QrCodeGenerator } from '../common/utils/qr-code-generator';

@Injectable()
export class QrCodeService {
  constructor(
    @InjectRepository(QrCode)
    private readonly qrCodeRepository: Repository<QrCode>,
    private readonly qrCodeGenerator: QrCodeGenerator,
  ) {}

  async createQrCode(
    userId: string,
    dto: CreateQrDto,
  ): Promise<{ qrCode: QrCode; qrCodeDataUrl: string }> {
    var dynamicId = this.generateDynamicId();
    var qrCode = this.qrCodeRepository.create({
      userId,
      type: dto.type,
      url: dto.url,
      dynamicId: dynamicId,
      createdAt: new Date(),
    });
    await this.qrCodeRepository.save(qrCode);
    const qrCodeUrl = 'http://localhost:3000/qr/' + dynamicId;
    const qrCodeDataUrl = await this.qrCodeGenerator.generateQrCode(qrCodeUrl);
    qrCode.qrImageUrl = qrCodeDataUrl;
    await this.qrCodeRepository.save(qrCode);
    return { qrCode, qrCodeDataUrl };
  }

  async updateDynamicQr(
    userId: string,
    id: ObjectId,
    dto: UpdateQrDto,
  ): Promise<QrCode> {
    const qrCode = await this.qrCodeRepository.findOne({ where: { _id: id } });
    if (!qrCode) throw new NotFoundException('QR Code not found');
    if (qrCode.userId !== userId) throw new ForbiddenException('Access denied');
    if (qrCode.type === 'static') throw new ForbiddenException('Cannot update a static QR code');

    qrCode.url = dto.newUrl;
    qrCode.updatedAt = new Date();
    return this.qrCodeRepository.save(qrCode);
  }

  async getUserQrCodes(userId: string): Promise<QrCode[]> {
    return this.qrCodeRepository.find({ where: { userId } });
  }

  private generateDynamicId(): string {
    return new ObjectId().toHexString();
  }
}
