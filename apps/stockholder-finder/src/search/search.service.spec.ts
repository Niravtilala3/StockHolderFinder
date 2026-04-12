import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';

describe('SearchService', () => {
  let service: SearchService;
  let esService: ElasticsearchService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: ElasticsearchService,
          useValue: { ping: jest.fn().mockResolvedValue(true) },
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
    esService.index = jest.fn().mockResolvedValue({ result: 'created' });
    esService.search = jest.fn().mockResolvedValue({
      hits: { hits: [{ _source: { id: '1', name: 'John Doe' } }] },
    });

    await service.indexShareholder('1', 'John Doe');
    expect(esService.index).toHaveBeenCalledWith({
      index: 'shareholders',
      id: '1',
      document: { name: 'John Doe' },
    });

    const results = await service.searchShareholders('John');
    expect(esService.search).toHaveBeenCalled();
    expect(results).toEqual([{ id: '1', name: 'John Doe' }]);
  });
});
