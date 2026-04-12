import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { InternalServerErrorException } from '@nestjs/common';

describe('SearchService', () => {
  let service: SearchService;
  let esService: ElasticsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: ElasticsearchService,
          useValue: { 
            ping: jest.fn().mockResolvedValue(true),
            index: jest.fn(),
            search: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    esService = module.get<ElasticsearchService>(ElasticsearchService);
  });

  it('should be defined and ping elasticsearch', async () => {
    expect(service).toBeDefined();
    const result = await service.ping();
    expect(result).toBe(true);
    expect(esService.ping).toHaveBeenCalled();
  });

  it('should index a shareholder and search it', async () => {
    (esService.index as jest.Mock).mockResolvedValue({ result: 'created' });
    (esService.search as jest.Mock).mockResolvedValue({
      hits: { hits: [{ _source: { id: '1', name: 'John Doe' } }] },
    });

    await service.indexShareholder('1', 'John Doe');
    expect(esService.index).toHaveBeenCalledWith({
      index: 'shareholders',
      id: '1',
      document: { name: 'John Doe' },
    });

    const results = await service.searchShareholders('John');
    expect(esService.search).toHaveBeenCalledWith({
      index: 'shareholders',
      from: 0,
      size: 10,
      query: {
        match: { name: { query: 'John', fuzziness: 'AUTO' } },
      },
    });
    expect(results).toEqual([{ id: '1', name: 'John Doe' }]);
  });

  it('should handle elasticsearch errors during index', async () => {
    (esService.index as jest.Mock).mockRejectedValue(new Error('ES Down'));
    await expect(service.indexShareholder('2', 'Jane Doe')).rejects.toThrow(InternalServerErrorException);
  });

  it('should handle elasticsearch errors during search', async () => {
    (esService.search as jest.Mock).mockRejectedValue(new Error('ES Down'));
    await expect(service.searchShareholders('Jane')).rejects.toThrow(InternalServerErrorException);
  });
});
