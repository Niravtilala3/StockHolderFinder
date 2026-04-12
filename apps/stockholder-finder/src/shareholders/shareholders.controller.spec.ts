import { Test, TestingModule } from '@nestjs/testing';
import { ShareholdersController } from './shareholders.controller';
import { ShareholdersService } from './shareholders.service';

describe('ShareholdersController', () => {
  let controller: ShareholdersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShareholdersController],
      providers: [
        {
          provide: ShareholdersService,
          useValue: { findOneWithHoldings: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ShareholdersController>(ShareholdersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
