import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareholdersService } from './shareholders.service';
import { ShareholdersController } from './shareholders.controller';
import { Shareholder } from '@app/database/entities/shareholder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shareholder])],
  controllers: [ShareholdersController],
  providers: [ShareholdersService],
})
export class ShareholdersModule {}
