import { Test, TestingModule } from '@nestjs/testing';
import { ShareholdersService } from './shareholders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Shareholder } from '@app/database/entities/shareholder.entity';

describe('ShareholdersService', () => {
  let service: ShareholdersService;
  const mockShareholderRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShareholdersService,
        {
          provide: getRepositoryToken(Shareholder),
          useValue: mockShareholderRepo,
        },
      ],
    }).compile();

    service = module.get<ShareholdersService>(ShareholdersService);
  });

  it('should find shareholder with holdings', async () => {
    const mockData = { id: '1', name: 'John Doe', holdings: [] };
    mockShareholderRepo.findOne.mockResolvedValue(mockData);

    const result = await service.findOneWithHoldings('1');
    expect(result).toEqual(mockData);
    expect(mockShareholderRepo.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
      relations: ['holdings', 'holdings.company'],
    });
  });
});
