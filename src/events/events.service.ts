import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { TrackEventDto } from './dto/track-event.dto';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { ObjectId } from 'mongodb';
import { ConfigService, ConfigModule } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EventsService {
  private readonly apiKey: string;
  private readonly openai: any;
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @InjectRepository(QrCode)
    private readonly qrCodeRepository: Repository<QrCode>,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = new OpenAI();

  }

  async trackEvent(qrId: string, event: Partial<Event>): Promise<Event> {
    const newEvent = this.eventRepository.create({ ...event, qrId });
    return this.eventRepository.save(newEvent);
  }

  async getEvents(qrId: string): Promise<Event[]> {
    return this.eventRepository.find({ where: { qrId } });
  }

  async getAnalytics(qrId: string, userId: string): Promise<any> {
    const qrCode = await this.qrCodeRepository.findOne({
      where: { _id: new ObjectId(qrId) },
    });
    if (!qrCode) {
      throw new NotFoundException('QR Code not found');
    }

    if (qrCode.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access analytics for this QR code',
      );
    }
    const events = await this.eventRepository.find({ where: { qrId } });
    if (events.length === 0) {
      throw new NotFoundException('No events found for this QR code');
    }

    // Aggregation logic for analytics
    const totalScans = events.length;
    const uniqueIps = new Set(events.map((event) => event.ip)).size;
    const trends = this.calculateTrends(events);
    const platforms = this.calculatePlatforms(events);
    const devices = this.calculateDevices(events);
    const locations = this.calculateLocations(events);
    const urls = this.calculateUrlClicks(events);
    const summary = await this.generateAISummary(
      totalScans,
      uniqueIps,
      trends,
      platforms,
      devices,
      locations,
      urls,
    );

    return {
      totalScans,
      uniqueUsers: uniqueIps,
      trends,
      platforms,
      devices,
      locations,
      urls,
      summary,
    };
  }

  private calculateTrends(events: Event[]) {
    const trends = {};
    events.forEach((event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      trends[date] = (trends[date] || 0) + 1;
    });
    return trends;
  }

  private calculatePlatforms(events: Event[]) {
    const platforms = {};
    events.forEach((event) => {
      platforms[event.platform] = (platforms[event.platform] || 0) + 1;
    });
    return platforms;
  }

  private calculateDevices(events: Event[]) {
    const devices = {};
    events.forEach((event) => {
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

  private calculateUrlClicks(events: Event[]) {
    const urls = {};
    events.forEach((event) => {
      urls[event.url] = (urls[event.url] || 0) + 1;
    });
    return urls;
  }

  private async generateAISummary(
    totalScans: number,
    uniqueIps: number,
    trends: any,
    platforms: any,
    devices: any,
    locations: any,
    urls: any,
  ): Promise<string> {
    const summaryInput = `
      Total scans: ${totalScans}.
      Unique users: ${uniqueIps}.
      Trends: ${Object.entries(trends)
        .map(([date, count]) => `${date}: ${count} scans`)
        .join(', ')}.
      Platforms: ${Object.entries(platforms)
        .map(([platform, count]) => `${platform}: ${count}`)
        .join(', ')}.
      Devices: ${Object.entries(devices)
        .map(([device, count]) => `${device}: ${count}`)
        .join(', ')}.
      Locations: ${Object.entries(locations)
        .map(([location, count]) => `${location}: ${count}`)
        .join(', ')}.
      URLs: ${Object.entries(urls)
        .map(([url, count]) => `${url}: ${count} clicks`)
        .join(', ')}.
    `;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: summaryInput,
        },
        ],
        max_tokens: 4096,
        temperature: 0.7,
      });
      return response.choices[0].message?.content || 'Unable to generate summary.';
    } catch (error) {
      console.error('Error generating summary with OpenAI:', error);
      throw new Error('Failed to generate AI summary.');
    }
  }
}
