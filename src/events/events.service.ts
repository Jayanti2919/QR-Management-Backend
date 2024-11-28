import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TrackEventDto } from './dto/track-event.dto';
import { QrCode } from 'src/qr-codes/entities/qr-code.entity';
import { ObjectId } from 'mongodb';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private readonly eventRepository: Repository<Event>,
    @InjectRepository(QrCode) private readonly qrCodeRepository: Repository<QrCode>,
  ) {}

  async trackEvent(qrId: string, event: Partial<Event>): Promise<Event> {
    const newEvent = this.eventRepository.create({ ...event, qrId });
    return this.eventRepository.save(newEvent);
  }

  async getEvents(qrId: string): Promise<Event[]> {
    return this.eventRepository.find({ where: { qrId } });
  }

  async getAnalytics(qrId: string, userId: string): Promise<any> {
    const qrCode = await this.qrCodeRepository.findOne({ where: { _id: new ObjectId(qrId) } });
    if (!qrCode) {
      throw new NotFoundException('QR Code not found');
    }

    if (qrCode.userId !== userId) {
      throw new ForbiddenException('You do not have permission to access analytics for this QR code');
    }
    const events = await this.eventRepository.find({ where: { qrId } });
    if (events.length === 0) {
      throw new NotFoundException('No events found for this QR code');
    }

    // Aggregation logic for analytics
    const totalScans = events.length;
    const uniqueIps = new Set(events.map(event => event.ip)).size;
    const trends = this.calculateTrends(events);
    const platforms = this.calculatePlatforms(events);
    const devices = this.calculateDevices(events);
    const locations = this.calculateLocations(events);

    return {
      totalScans,
      uniqueUsers: uniqueIps,
      trends,
      platforms,
      devices,
      locations,
    };
  }

  private calculateTrends(events: Event[]) {
    const trends = {};
    events.forEach(event => {
      const date = event.timestamp.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });
    return trends;
  }

  private calculatePlatforms(events: Event[]) {
    const platforms = {};
    events.forEach(event => {
      platforms[event.platform] = (platforms[event.platform] || 0) + 1;
    });
    return platforms;
  }

  private calculateDevices(events: Event[]) {
    const devices = {};
    events.forEach(event => {
      devices[event.device] = (devices[event.device] || 0) + 1;
    });
    return devices;
  }

  private calculateLocations(events: Event[]) {
    const locations = {};
    events.forEach((event) => {
      locations[event.location] = (locations[event.location] || 0) + 1;
    });
    return locations;
  }
}
