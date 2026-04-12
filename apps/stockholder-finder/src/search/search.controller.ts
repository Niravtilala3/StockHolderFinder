import { Controller, Get, Query } from '@nestjs/common';
import { SearchService, Shareholder } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('shareholders')
  async searchShareholders(
    @Query('q') q: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<Shareholder[]> {
    if (!q) return [];
    
    const parsedLimit = limit ? parseInt(limit, 10) : 10;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    
    return this.searchService.searchShareholders(q, parsedLimit, parsedOffset);
  }
}
