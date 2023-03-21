import { Test, TestingModule } from '@nestjs/testing';
import { MasterCatalogService } from './master-catalog.service';

describe('MasterCatalogService', () => {
  let service: MasterCatalogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterCatalogService],
    }).compile();

    service = module.get<MasterCatalogService>(MasterCatalogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
