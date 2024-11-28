import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfigAsync } from './database/typeorm.config';
import { AuthModule } from './auth/auth.module';
import { QrCodeModule } from './qr-codes/qr-code.module';
import { EventsModule } from './events/events.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    QrCodeModule,
    EventsModule,
  ],
})
export class AppModule {}
