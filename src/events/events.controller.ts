import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { TrackEventDto } from './dto/track-event.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { ApiTags } from '@nestjs/swagger';

@Controller('qr/:id')
@ApiTags('docs')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post('track')
  async trackEvent(@Param('id') id: string, @Body() dto: TrackEventDto) {
    return this.eventsService.trackEvent(id, dto);
  }

  @Get('events')
  async getEvents(@Param('id') id: string) {
    return this.eventsService.getEvents(id);
  }

  @Get('analytics')
  @UseGuards(JwtAuthGuard) // Protect analytics with JWT
  async getAnalytics(@Param('id') id: string, @Request() req) {
    return this.eventsService.getAnalytics(id, req.user.id);
  }
}
