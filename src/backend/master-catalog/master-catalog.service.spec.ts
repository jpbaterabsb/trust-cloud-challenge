import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MasterProduct } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { MasterCatalogService } from './master-catalog.service';

describe('MasterCatalog', () => {
  let service: MasterCatalogService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MasterCatalogService, PrismaService],
    }).compile();

    service = module.get<MasterCatalogService>(MasterCatalogService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('createProduct', () => {
    it('should create a new master product if part number is valid', async () => {
      const masterProduct: MasterProduct = {
        partNumber: 'ABCD1234',
        name: 'Test Product',
        description: 'This is a test product',
        price: 10,
        logo: 'test.png',
        picture: 'test.png',
      } as any;

      const createSpy = jest
        .spyOn(prismaService.masterProduct, 'create')
        .mockResolvedValueOnce(masterProduct);

      const result = await service.createProduct(masterProduct);

      expect(createSpy).toHaveBeenCalledWith({ data: masterProduct });
      expect(result).toEqual(masterProduct);
    });

    it('should throw an error if part number already exists', async () => {
      const masterProduct: MasterProduct = {
        partNumber: 'ABCD1234',
        name: 'Test Product',
        description: 'This is a test product',
        price: 10,
        logo: 'test.png',
        picture: 'test.png',
      } as any;

      jest
        .spyOn(prismaService.masterProduct, 'findUnique')
        .mockResolvedValueOnce(masterProduct);

      await expect(service.createProduct(masterProduct)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('updateProduct', () => {
    const existingProductId = 1;
    const existingMasterProduct: MasterProduct = {
      id: existingProductId,
      partNumber: 'ABC123',
      name: 'Product',
      description: 'Product description',
      price: 100,
      logo: 'logo.png',
      picture: 'picture.png',
      masterCatalogId: 1,
    } as any;

    beforeEach(() => {
      jest
        .spyOn(prismaService.masterProduct, 'findUnique')
        .mockResolvedValue(existingMasterProduct);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should throw a NotFoundException if master product is not found', async () => {
      jest
        .spyOn(prismaService.masterProduct, 'findUnique')
        .mockResolvedValue(null);

      await expect(
        service.updateProduct(existingProductId, {
          partNumber: 'DEF456',
        } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a BadRequestException if part number already exists', async () => {
      const newPartNumber = 'DEF456';
      const existingPartNumber = 'ABC123';
      const existingProductWithNewPartNumber: MasterProduct = {
        ...existingMasterProduct,
        partNumber: newPartNumber,
      };
      jest
        .spyOn(prismaService.masterProduct, 'findUnique')
        .mockResolvedValue(existingProductWithNewPartNumber);

      await expect(
        service.updateProduct(existingProductId, {
          partNumber: existingPartNumber,
        } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update the master product with the new data and return it', async () => {
      const newPartNumber = 'DEF456';
      const newProductData: Omit<MasterProduct, 'id' | 'masterCatalogId'> = {
        partNumber: newPartNumber,
        name: 'New Product',
        description: 'New Product description',
        price: 200,
        logo: 'new-logo.png',
        picture: 'new-picture.png',
      } as any;
      const expectedUpdatedProduct: MasterProduct = {
        ...existingMasterProduct,
        ...newProductData,
      };

      jest
        .spyOn(prismaService.masterProduct, 'findUnique')
        .mockResolvedValueOnce(existingMasterProduct)
        .mockResolvedValueOnce(undefined);

      const prismaTransactionMock = jest
        .fn()
        .mockImplementation(async (callback) => {
          return await callback(prismaService);
        });
      jest
        .spyOn(prismaService, '$transaction')
        .mockImplementation(prismaTransactionMock);

      const result = await service.updateProduct(
        existingProductId,
        newProductData as any,
      );

      expect(prismaTransactionMock).toHaveBeenCalled();
      expect(prismaService.masterProduct.findUnique).toHaveBeenCalled();
      delete result.createdAt;
      delete result.updatedAt;
      delete result.status;
      expect(result).toEqual(expectedUpdatedProduct);
    });
  });
});
