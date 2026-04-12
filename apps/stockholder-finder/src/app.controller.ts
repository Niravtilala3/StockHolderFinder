import { Controller, Get, Post, Body, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppService } from './app.service';

@Controller('api/v1')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectQueue('ingestion') private readonly ingestionQueue: Queue,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('ingest/trigger')
  async triggerIngestion(@Body() data: { symbol: string; url: string }) {
    const job = await this.ingestionQueue.add('parse-pdf', {
      symbol: data.symbol,
      url: data.url,
    });
    return {
      message: 'Ingestion job triggered successfully',
      jobId: job.id,
      symbol: data.symbol,
    };
  }
}
