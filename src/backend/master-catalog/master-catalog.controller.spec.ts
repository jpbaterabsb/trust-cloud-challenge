import { Test, TestingModule } from '@nestjs/testing';
import { MasterCatalogController } from './master-catalog.controller';
import { MasterCatalogService } from './master-catalog.service';

describe('MasterCatalogController', () => {
  let controller: MasterCatalogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MasterCatalogController],
      providers: [MasterCatalogService],
    }).compile();

    controller = module.get<MasterCatalogController>(MasterCatalogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
