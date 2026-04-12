import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('shareholders')
  async searchShareholders(@Query('q') q: string) {
    if (!q) return [];
    return this.searchService.searchShareholders(q);
  }
}
