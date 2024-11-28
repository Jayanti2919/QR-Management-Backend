import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfigAsync = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
    type: 'mongodb',
    url: configService.get<string>('MONGO_URI'), // MongoDB connection URI from .env
    useNewUrlParser: true,
    useUnifiedTopology: true,
    database: "qr-management-website",
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
};
