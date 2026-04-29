import { Module } from '@nestjs/common';
import { NseScraperService } from './nse-scraper.service';
import { BseScraperService } from './bse-scraper.service';

@Module({
  providers: [NseScraperService, BseScraperService],
  exports: [NseScraperService, BseScraperService],
})
export class ScraperModule {}