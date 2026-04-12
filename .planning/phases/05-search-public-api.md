# Phase 5: Search & Public API Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Index normalized data into Elasticsearch for rapid querying, and build REST endpoints for search, company ownership patterns, and individual holdings tracking.

**Architecture:** We will integrate `@nestjs/elasticsearch` to communicate with our local Elasticsearch cluster. The Search Module handles indexing entities (Shareholders, Companies) and fuzzy string matching. The Companies and Shareholders Modules provide dedicated REST endpoints that fetch relationship data (holdings) via TypeORM.

**Tech Stack:** NestJS, `@nestjs/elasticsearch`, Elasticsearch 8, TypeORM, PostgreSQL.

---

### Task 1: Install and Configure Elasticsearch Module

**Files:**
- Create: `apps/stockholder-finder/src/search/search.module.ts` (Modify)
- Create: `apps/stockholder-finder/src/search/search.service.ts` (Modify)
- Create: `apps/stockholder-finder/src/search/search.service.spec.ts` (Modify)

- [ ] **Step 1: Install dependencies**

```bash
npm install @nestjs/elasticsearch @elastic/elasticsearch
```

- [ ] **Step 2: Update SearchService test to expect an Elasticsearch client**

```typescript
// apps/stockholder-finder/src/search/search.service.spec.ts
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
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx jest apps/stockholder-finder/src/search/search.service.spec.ts`
Expected: FAIL due to `service.ping()` not existing.

- [ ] **Step 4: Implement basic Elasticsearch config in Search module**

```typescript
// apps/stockholder-finder/src/search/search.module.ts
import { Module } from '@nestjs/common';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [
    ElasticsearchModule.register({
      node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    }),
  ],
  providers: [SearchService],
  controllers: [SearchController],
  exports: [SearchService],
})
export class SearchModule {}
```

```typescript
// apps/stockholder-finder/src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  async ping(): Promise<boolean> {
    const result = await this.elasticsearchService.ping();
    return !!result;
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx jest apps/stockholder-finder/src/search/search.service.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/stockholder-finder/src/search package.json package-lock.json
git commit -m "feat(search): configure elasticsearch module and client"
```

### Task 2: Implement Elasticsearch Indexing & Search

**Files:**
- Modify: `apps/stockholder-finder/src/search/search.service.spec.ts`
- Modify: `apps/stockholder-finder/src/search/search.service.ts`
- Modify: `apps/stockholder-finder/src/search/search.controller.ts`

- [ ] **Step 1: Write test for indexing and searching**

```typescript
// apps/stockholder-finder/src/search/search.service.spec.ts
// Add this inside the describe block
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest apps/stockholder-finder/src/search/search.service.spec.ts`
Expected: FAIL because `indexShareholder` and `searchShareholders` do not exist.

- [ ] **Step 3: Implement indexing and search in service**

```typescript
// apps/stockholder-finder/src/search/search.service.ts
// Add these methods inside SearchService class:
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
```

- [ ] **Step 4: Expose search in controller**

```typescript
// apps/stockholder-finder/src/search/search.controller.ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest apps/stockholder-finder/src/search/search.service.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/stockholder-finder/src/search
git commit -m "feat(search): implement shareholder indexing and fuzzy search endpoint"
```

### Task 3: Shareholder Holdings Endpoint

**Files:**
- Modify: `apps/stockholder-finder/src/shareholders/shareholders.module.ts`
- Modify: `apps/stockholder-finder/src/shareholders/shareholders.service.ts`
- Modify: `apps/stockholder-finder/src/shareholders/shareholders.controller.ts`

- [ ] **Step 1: Import Database entities and build test**

```typescript
// apps/stockholder-finder/src/shareholders/shareholders.service.spec.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest apps/stockholder-finder/src/shareholders/shareholders.service.spec.ts`
Expected: FAIL because `findOneWithHoldings` doesn't exist.

- [ ] **Step 3: Implement Shareholder Service**

```typescript
// apps/stockholder-finder/src/shareholders/shareholders.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShareholdersService } from './shareholders.service';
import { ShareholdersController } from './shareholders.controller';
import { Shareholder } from '@app/database/entities/shareholder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shareholder])],
  controllers: [ShareholdersController],
  providers: [ShareholdersService],
})
export class ShareholdersModule {}
```

```typescript
// apps/stockholder-finder/src/shareholders/shareholders.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shareholder } from '@app/database/entities/shareholder.entity';

@Injectable()
export class ShareholdersService {
  constructor(
    @InjectRepository(Shareholder)
    private shareholderRepository: Repository<Shareholder>,
  ) {}

  async findOneWithHoldings(id: string): Promise<Shareholder> {
    const shareholder = await this.shareholderRepository.findOne({
      where: { id },
      relations: ['holdings', 'holdings.company'],
    });
    if (!shareholder) {
      throw new NotFoundException(`Shareholder with ID ${id} not found`);
    }
    return shareholder;
  }
}
```

- [ ] **Step 4: Implement Shareholder Controller**

```typescript
// apps/stockholder-finder/src/shareholders/shareholders.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { ShareholdersService } from './shareholders.service';

@Controller('shareholders')
export class ShareholdersController {
  constructor(private readonly shareholdersService: ShareholdersService) {}

  @Get(':id')
  async getShareholder(@Param('id') id: string) {
    return this.shareholdersService.findOneWithHoldings(id);
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest apps/stockholder-finder/src/shareholders/shareholders.service.spec.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add apps/stockholder-finder/src/shareholders
git commit -m "feat(shareholders): add endpoint to fetch shareholder with holdings"
```

### Task 4: Update App Module & Update STATE

**Files:**
- Modify: `apps/stockholder-finder/src/app.module.ts`
- Modify: `.planning/STATE.md`

- [ ] **Step 1: Ensure TypeORM and our new modules are imported in AppModule**

```typescript
// apps/stockholder-finder/src/app.module.ts
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/database';
import { SearchModule } from './search/search.module';
import { CompaniesModule } from './companies/companies.module';
import { ShareholdersModule } from './shareholders/shareholders.module';

@Module({
  imports: [
    DatabaseModule,
    SearchModule,
    CompaniesModule,
    ShareholdersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

- [ ] **Step 2: Update project state tracking**

```bash
sed -i.bak 's/last_completed_plan: 04-entity-resolution-engine/last_completed_plan: 05-search-public-api/' .planning/STATE.md
```

- [ ] **Step 3: Commit**

```bash
git add apps/stockholder-finder/src/app.module.ts .planning/STATE.md
git commit -m "chore: wire Phase 5 modules to app module and update state"
```
