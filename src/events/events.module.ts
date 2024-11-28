import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { QrCode } from '../qr-codes/entities/qr-code.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, QrCode]),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
