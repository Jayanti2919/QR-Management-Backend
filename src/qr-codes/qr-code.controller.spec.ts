import { Test, TestingModule } from '@nestjs/testing';
import { QrCodeController } from './qr-code.controller';
import { QrCodeService } from './qr-code.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CreateQrDto } from './dto/create-qr.dto';
import { UpdateQrDto } from './dto/update-qr.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QrCode } from './entities/qr-code.entity';
import { ObjectId } from 'mongodb';
import { QrCodeGenerator } from '../common/utils/qr-code-generator';

jest.mock('../auth/guard/jwt-auth.guard'); // Mock JwtAuthGuard

describe('QrCodeController', () => {
  let qrCodeController: QrCodeController;
  let qrCodeService: QrCodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QrCodeController],
      providers: [
        QrCodeService,
        {
          provide: getRepositoryToken(QrCode),
          useValue: {}, // Mock repository if needed for tests
        },
        QrCodeGenerator,
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mock the JwtAuthGuard
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    qrCodeController = module.get<QrCodeController>(QrCodeController);
    qrCodeService = module.get<QrCodeService>(QrCodeService);
  });

  describe('createDynamicQr', () => {
    it('should create a QR code and return the data', async () => {
      const createQrDto: CreateQrDto = {
        type: 'dynamic',
        url: 'http://example.com',
      };
      const userId = 'some-user-id';
      const qrCode = {
        _id: new ObjectId(),
        userId,
        ...createQrDto,
        createdAt: new Date(),
      } as QrCode;
      const qrCodeDataUrl = 'data:image/png;base64,xyz'; // Mocked data URL

      jest
        .spyOn(qrCodeService, 'createQrCode')
        .mockResolvedValue({ qrCode, qrCodeDataUrl });

      const result = await qrCodeController.createDynamicQr(
        { user: { id: userId } },
        createQrDto,
      );

      expect(result).toEqual({ qrCode, qrCodeDataUrl });
      expect(qrCodeService.createQrCode).toHaveBeenCalledWith(
        userId,
        createQrDto,
      );
    });
  });

  describe('updateDynamicQr', () => {
    it('should update a dynamic QR code', async () => {
      const updateQrDto: UpdateQrDto = { newUrl: 'http://new-url.com' };
      const userId = 'some-user-id';
      const qrCodeId = new ObjectId();
      const qrCode = {
        _id: qrCodeId,
        userId,
        type: 'dynamic',
        url: 'http://old-url.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as QrCode;

      jest.spyOn(qrCodeService, 'updateDynamicQr').mockResolvedValue(qrCode);

      const result = await qrCodeController.updateDynamicQr(
        { user: { id: userId } },
        qrCodeId.toHexString(),
        updateQrDto,
      );

      expect(result).toEqual(qrCode);
      expect(qrCodeService.updateDynamicQr).toHaveBeenCalledWith(
        userId,
        qrCodeId,
        updateQrDto,
      );
    });

    it('should throw ForbiddenException if trying to update a static QR code', async () => {
      const updateQrDto: UpdateQrDto = { newUrl: 'http://new-url.com' };
      const userId = 'some-user-id';
      const qrCodeId = new ObjectId();
      const qrCode = {
        _id: qrCodeId,
        userId,
        type: 'static', // Static QR code, should not be updated
        url: 'http://old-url.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as QrCode;

      jest.spyOn(qrCodeService, 'updateDynamicQr').mockRejectedValue(new ForbiddenException('Cannot update a static QR code'));

      await expect(
        qrCodeController.updateDynamicQr(
          { user: { id: userId } },
          qrCodeId.toHexString(),
          updateQrDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if QR code is not found', async () => {
      const updateQrDto: UpdateQrDto = { newUrl: 'http://new-url.com' };
      const userId = 'some-user-id';
      const qrCodeId = new ObjectId();

      jest
        .spyOn(qrCodeService, 'updateDynamicQr')
        .mockRejectedValue(new NotFoundException('QR Code not found'));

      await expect(
        qrCodeController.updateDynamicQr(
          { user: { id: userId } },
          qrCodeId.toHexString(),
          updateQrDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMyQrCodes', () => {
    it('should return all QR codes for the user', async () => {
      const userId = 'some-user-id';
      const qrCodes: QrCode[] = [
        {
          _id: new ObjectId(),
          userId,
          type: 'dynamic',
          url: 'http://example.com',
          createdAt: new Date(),
          qrImageUrl: 'data:image/png;base64,xyz',
          dynamicId: 'https://localhost:3000/xyz',
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(qrCodeService, 'getUserQrCodes').mockResolvedValue(qrCodes);

      const result = await qrCodeController.getMyQrCodes({
        user: { id: userId },
      });

      expect(result).toEqual(qrCodes);
      expect(qrCodeService.getUserQrCodes).toHaveBeenCalledWith(userId);
    });
  });
});
