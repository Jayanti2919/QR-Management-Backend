import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { TrackEventDto } from './dto/track-event.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { ObjectId } from 'mongodb';

jest.mock('../auth/guard/jwt-auth.guard'); // Mock JwtAuthGuard

describe('EventsController', () => {
  let eventsController: EventsController;
  let eventsService: EventsService;

  // Mocking the EventsService methods
  const mockEventsService = {
    trackEvent: jest.fn(),
    getEvents: jest.fn(),
    getAnalytics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Mocking JwtAuthGuard to allow all requests in test
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    eventsController = module.get<EventsController>(EventsController);
    eventsService = module.get<EventsService>(EventsService);
  });

  describe('trackEvent', () => {
    it('should track an event successfully', async () => {
      const qrId = 'qr123';
      const trackEventDto: TrackEventDto = { ip: '127.0.0.1', platform: 'web', device: 'mobile', location: 'US', url: "https://example.com" };
      const event = { timestamp:new Date(), qrId: "23144ewq", ...trackEventDto } as Event;

      mockEventsService.trackEvent.mockResolvedValue(event);

      const result = await eventsController.trackEvent(qrId, trackEventDto);
      expect(result).toEqual(event);
      expect(eventsService.trackEvent).toHaveBeenCalledWith(qrId, trackEventDto);
    });
  });

  describe('getEvents', () => {
    it('should return a list of events', async () => {
      const qrId = 'qr123';
      const events = [
        { qrId, ip: '127.0.0.1', platform: 'web', device: 'mobile' } as Event,
      ];

      mockEventsService.getEvents.mockResolvedValue(events);

      const result = await eventsController.getEvents(qrId);
      expect(result).toEqual(events);
      expect(eventsService.getEvents).toHaveBeenCalledWith(qrId);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics data if the user is authorized', async () => {
      const qrId = 'qr123';
      const userId = 'user123';
      const analytics = {
        totalScans: 5,
        uniqueUsers: 3,
        trends: {},
        platforms: {},
        devices: {},
        locations: {},
        urls: {},
        summary: 'Analytics summary',
      };

      mockEventsService.getAnalytics.mockResolvedValue(analytics);

      const req = { user: { id: userId } }; // Simulate request object with user data
      const result = await eventsController.getAnalytics(qrId, req);

      expect(result).toEqual(analytics);
      expect(eventsService.getAnalytics).toHaveBeenCalledWith(qrId, userId);
    });

    it('should throw ForbiddenException if the user does not have permission to access analytics', async () => {
      const qrId = 'qr123';
      const userId = 'user123';
      const analytics = {
        totalScans: 5,
        uniqueUsers: 3,
        trends: {},
        platforms: {},
        devices: {},
        locations: {},
        urls: {},
        summary: 'Analytics summary',
      };

      // Mock an analytics response but with a different userId
      mockEventsService.getAnalytics.mockRejectedValue(new ForbiddenException('You do not have permission'));

      const req = { user: { id: 'anotherUser' } }; // Simulate another user
      await expect(eventsController.getAnalytics(qrId, req)).rejects.toThrow(ForbiddenException);
      expect(eventsService.getAnalytics).toHaveBeenCalledWith(qrId, 'anotherUser');
    });

    it('should throw NotFoundException if no events are found for the QR code', async () => {
      const qrId = 'qr123';
      const userId = 'user123';

      mockEventsService.getAnalytics.mockRejectedValue(new NotFoundException('No events found for this QR code'));

      const req = { user: { id: userId } }; // Simulate request object with user data
      await expect(eventsController.getAnalytics(qrId, req)).rejects.toThrow(NotFoundException);
      expect(eventsService.getAnalytics).toHaveBeenCalledWith(qrId, userId);
    });
  });
});
