import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { Company } from './entities/company.entity';
import { Shareholder } from './entities/shareholder.entity';
import { ShareholdingPattern } from './entities/shareholding-pattern.entity';
import { Holding } from './entities/holding.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST', 'localhost'),
        port: configService.get<number>('POSTGRES_PORT', 5432),
        username: configService.get<string>(
          'POSTGRES_USER',
          'stockholder_user',
        ),
        password: configService.get<string>(
          'POSTGRES_PASSWORD',
          'stockholder_pass',
        ),
        database: configService.get<string>('POSTGRES_DB', 'stockholder_db'),
        entities: [Company, Shareholder, ShareholdingPattern, Holding],
        synchronize: true, // Use migrations in production
      }),
    }),
    TypeOrmModule.forFeature([
      Company,
      Shareholder,
      ShareholdingPattern,
      Holding,
    ]),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService, TypeOrmModule],
})
export class DatabaseModule {}
