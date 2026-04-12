import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

export interface Shareholder {
  id?: string;
  name: string;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly INDEX_NAME = 'shareholders';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async ping(): Promise<boolean> {
    try {
      const result = await this.elasticsearchService.ping();
      return !!result;
    } catch (error) {
      this.logger.error('Elasticsearch ping failed', error);
      return false;
    }
  }

  async indexShareholder(id: string, name: string): Promise<void> {
    try {
      await this.elasticsearchService.index({
        index: this.INDEX_NAME,
        id,
        document: { name },
      });
    } catch (error) {
      this.logger.error(`Failed to index shareholder ${id}`, error);
      throw new InternalServerErrorException('Failed to index shareholder');
    }
  }

  async searchShareholders(query: string, limit = 10, offset = 0): Promise<Shareholder[]> {
    try {
      const result = await this.elasticsearchService.search<Shareholder>({
        index: this.INDEX_NAME,
        from: offset,
        size: limit,
        query: {
          match: { name: { query, fuzziness: 'AUTO' } },
        },
      });
      return result.hits.hits.map((hit) => hit._source as Shareholder);
    } catch (error) {
      this.logger.error(`Failed to search shareholders with query ${query}`, error);
      throw new InternalServerErrorException('Failed to search shareholders');
    }
  }
}
