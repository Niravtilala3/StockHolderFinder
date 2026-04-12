import { Module } from '@nestjs/common';
import { ShareholdersService } from './shareholders.service';
import { ShareholdersController } from './shareholders.controller';

@Module({
  providers: [ShareholdersService],
  controllers: [ShareholdersController]
})
export class ShareholdersModule {}
