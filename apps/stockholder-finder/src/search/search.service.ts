import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async ping(): Promise<boolean> {
    const result = await this.elasticsearchService.ping();
    return !!result;
  }

  async indexShareholder(id: string, name: string) {
    return this.elasticsearchService.index({
      index: 'shareholders',
      id,
      document: { name },
    });
  }

  async searchShareholders(query: string) {
    const result = await this.elasticsearchService.search({
      index: 'shareholders',
      query: {
        match: { name: { query, fuzziness: 'AUTO' } },
      },
    });
    return result.hits.hits.map((hit: any) => hit._source);
  }
}
