import { Test } from '@nestjs/testing';
import { CatalogService } from './catalog.service';
import { PrismaService } from 'src/prisma.service';
import {
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  AddCatalogProductDTO,
  AddCatalogProductWithoutMasterProductDTO,
} from './dto/create-catalog.dto';
import { User } from '../auth/entities/user.dto';
import * as classValidator from 'class-validator';

describe('CatalogService', () => {
  let catalogService: CatalogService;
  let prismaService: PrismaService;
  let warn = null;

  beforeEach(async () => {
    warn = console.warn;
    console.warn = jest.fn();
    const moduleRef = await Test.createTestingModule({
      providers: [CatalogService, PrismaService],
    }).compile();
    catalogService = moduleRef.get<CatalogService>(CatalogService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    console.warn = warn;
  });

  describe('createCatalogProduct', () => {
    it('should return a catalog product', async () => {
      const catalog = { id: 1, oemId: 1 };
      const user = { id: 1, roles: ['admin'] };
      const addCatalogProductDTO: AddCatalogProductDTO = {
        name: 'Product 1',
        description: 'Description 1',
        price: 9.99,
        catalogId: catalog.id,
      };
      const upsertedProduct = { id: 1, ...addCatalogProductDTO };
      jest
        .spyOn(catalogService, 'findById')
        .mockResolvedValueOnce(catalog as any);
      jest
        .spyOn(prismaService.product, 'upsert')
        .mockResolvedValueOnce(upsertedProduct as any);

      const result = await catalogService.createCatalogProduct(
        catalog.id,
        user as User,
        addCatalogProductDTO,
      );

      expect(result).toEqual(upsertedProduct);
    });

    it('should throw NotFoundException if catalog not found', async () => {
      const catalog = undefined;
      const user = { id: 1, roles: ['admin'] };
      const addCatalogProductDTO: AddCatalogProductDTO = {
        name: 'Product 1',
        description: 'Description 1',
        price: 9.99,
        catalogId: 1,
      };
      jest.spyOn(catalogService, 'findById').mockResolvedValueOnce(catalog);

      try {
        await catalogService.createCatalogProduct(
          addCatalogProductDTO.catalogId,
          user as User,
          addCatalogProductDTO,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe("the catalog doesn't exist");
      }
    });

    it('should throw UnauthorizedException if user is not authorized to create product in catalog', async () => {
      const catalog = { id: 1, oemId: 2 };
      const user = { id: 1, roles: ['admin'] };
      const addCatalogProductDTO: AddCatalogProductDTO = {
        name: 'Product 1',
        description: 'Description 1',
        price: 9.99,
        catalogId: catalog.id,
      };
      jest
        .spyOn(catalogService, 'findById')
        .mockResolvedValueOnce(catalog as any);

      try {
        await catalogService.createCatalogProduct(
          addCatalogProductDTO.catalogId,
          user as User,
          addCatalogProductDTO,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });

  describe('createOrUpdateCatalogProduct', () => {
    it('should create a new product without master product reference', async () => {
      const addCatalogProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10,
        logo: 'Test Logo',
        picture: 'Test Picture',
        catalogId: 1,
      };
      const expectedProduct = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10,
        logo: 'Test Logo',
        masterProductPartNumber: null,
        picture: 'Test Picture',
        catalogId: 1,
      };

      jest
        .spyOn(catalogService, 'validateProductWithoutMasterProductReference')
        .mockResolvedValue(undefined);
      jest
        .spyOn(catalogService, 'upsertCatalogProduct')
        .mockResolvedValue(expectedProduct as any);

      const actualProduct = await catalogService.createOrUpdateCatalogProduct(
        addCatalogProductDTO,
      );

      expect(
        catalogService.validateProductWithoutMasterProductReference,
      ).toHaveBeenCalledWith(addCatalogProductDTO);
      expect(catalogService.upsertCatalogProduct).toHaveBeenCalledWith(
        expectedProduct as any,
      );
      expect(actualProduct).toEqual(expectedProduct);
    });

    it('should create a new product with master product reference', async () => {
      const addCatalogProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 21,
        logo: 'Test Logo',
        picture: 'Test Picture',
        masterProductPartNumber: '123',
        catalogId: 1,
      };
      const expectedMasterProduct = {
        id: 1,
        name: 'Test Master Product',
        description: 'Test Master Description',
        price: 20,
        logo: 'Test Master Logo',
        picture: 'Test Master Picture',
        catalogId: 1,
      };
      const expectedProduct = {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 21,
        logo: 'Test Logo',
        picture: 'Test Picture',
        catalogId: 1,
      };

      jest
        .spyOn(catalogService, 'getMasterProductByPartNumber')
        .mockResolvedValue(expectedMasterProduct as any);
      jest
        .spyOn(catalogService, 'upsertCatalogProduct')
        .mockResolvedValue(expectedProduct as any);

      const actualProduct = await catalogService.createOrUpdateCatalogProduct(
        addCatalogProductDTO,
      );

      expect(catalogService.getMasterProductByPartNumber).toHaveBeenCalled();
      expect(catalogService.upsertCatalogProduct).toHaveBeenCalled();
      expect(actualProduct).toEqual(expectedProduct);
    });

    it('should throw a NotFoundException if master product is not found', async () => {
      const addCatalogProductDTO = {
        name: 'Test Product',
        description: 'Test Description',
        price: 10,
        logo: 'Test Logo',
        picture: 'Test Picture',
        masterProductPartNumber: '123',
        catalogId: 1,
      };

      jest
        .spyOn(catalogService, 'getMasterProductByPartNumber')
        .mockResolvedValue(null);

      await expect(
        catalogService.createOrUpdateCatalogProduct(addCatalogProductDTO),
      ).rejects.toThrowError(new NotFoundException('master product not exist'));
    });

    it('should throw an error if the product price is less than the master product price', async () => {
      const masterProduct = {
        id: 1,
        partNumber: 'M12345',
        name: 'Master Product A',
        description: 'Master Product A Description',
        price: 25,
        logo: 'Master Product A Logo',
        picture: 'Master Product A Picture',
        manufacturerId: 1,
      };

      const addCatalogProductDTO: AddCatalogProductDTO = {
        name: 'Product A',
        description: 'Product A Description',
        price: 20,
        logo: 'Product A Logo',
        picture: 'Product A Picture',
        masterProductPartNumber: 'M12345',
        catalogId: 1,
      };

      jest
        .spyOn(catalogService, 'getMasterProductByPartNumber')
        .mockResolvedValue(masterProduct as any);

      await expect(
        catalogService.createOrUpdateCatalogProduct(addCatalogProductDTO),
      ).rejects.toThrowError(
        'master product price should be greater or equals of product',
      );
    });

    it('should create a new product with master product', async () => {
      const masterProduct = {
        id: 1,
        partNumber: 'M12345',
        name: 'Master Product A',
        description: 'Master Product A Description',
        price: 20,
        logo: 'Master Product A Logo',
        picture: 'Master Product A Picture',
        manufacturerId: 1,
        masterCatalogId: null,
      };

      const addCatalogProductDTO: AddCatalogProductDTO = {
        name: 'Product A',
        description: 'Product A Description',
        price: 20,
        logo: 'Product A Logo',
        picture: 'Product A Picture',
        masterProductPartNumber: 'M12345',
        catalogId: 1,
      };

      const expectedProduct = {
        id: 1,
        name: 'Product A',
        description: 'Product A Description',
        price: 20,
        logo: 'Product A Logo',
        picture: 'Product A Picture',
        manufacturerId: 1,
        masterProductId: 1,
        catalogId: 1,
      };

      jest
        .spyOn(catalogService, 'getMasterProductByPartNumber')
        .mockResolvedValue(masterProduct as any);
      jest
        .spyOn(catalogService, 'upsertCatalogProduct')
        .mockResolvedValue(expectedProduct as any);

      const result = await catalogService.createOrUpdateCatalogProduct(
        addCatalogProductDTO,
      );

      expect(result).toEqual(expectedProduct);
    });
  });

  describe('validateProductWithoutMasterProductReference', () => {
    it('should not throw any error if the product is valid', async () => {
      const addCatalogProductDTO = {
        name: 'Product',
        description: 'Product description',
        price: 10,
        logo: 'logo.png',
        picture: 'picture.png',
        catalogId: 1,
      };
      const validationSpy = jest.spyOn(classValidator, 'validate');
      validationSpy.mockResolvedValue([]);

      await catalogService.validateProductWithoutMasterProductReference(
        addCatalogProductDTO,
      );

      expect(validationSpy).toHaveBeenCalledWith(
        expect.any(AddCatalogProductWithoutMasterProductDTO),
      );
    });

    it('should throw an UnprocessableEntityException if the product is invalid', async () => {
      const addCatalogProductDTO = {
        name: '',
        description: '',
        price: null,
        logo: '',
        picture: '',
        catalogId: 1,
      };

      const validationErrors = [
        {
          constraints: { isNotEmpty: 'name should not be empty' },
          property: 'name',
        },
        {
          constraints: { isNotEmpty: 'description should not be empty' },
          property: 'description',
        },
        {
          constraints: { isNumber: 'price must be a number' },
          property: 'price',
        },
      ];

      const expectedError = {
        error: 'Unprocessable Entity',
        message: [
          {
            constraints: { isNotEmpty: 'name should not be empty' },
            property: 'name',
          },
          {
            constraints: { isNotEmpty: 'description should not be empty' },
            property: 'description',
          },
          {
            constraints: { isNumber: 'price must be a number' },
            property: 'price',
          },
        ],
        statusCode: 422,
      };

      const validationSpy = jest.spyOn(classValidator, 'validate');
      validationSpy.mockResolvedValue(validationErrors);

      try {
        await catalogService.validateProductWithoutMasterProductReference(
          addCatalogProductDTO,
        );
        fail('should throw an UnprocessableEntityException');
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
        expect(error.message).toBe('Unprocessable Entity Exception');
        expect(error.getResponse()).toEqual(expectedError);
      }

      expect(validationSpy).toHaveBeenCalledWith(
        expect.any(AddCatalogProductWithoutMasterProductDTO),
      );
    });
  });

  describe('validateCatalog', () => {
    it('should throw a NotFoundException if catalog is not found', async () => {
      const catalogId = 1;
      const userId = 1;

      jest.spyOn(catalogService, 'findById').mockResolvedValueOnce(null);

      await expect(
        catalogService.validateCatalog(catalogId, userId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw an UnauthorizedException if user is not authorized to access the catalog', async () => {
      const catalogId = 1;
      const userId = 2;

      jest.spyOn(catalogService, 'findById').mockResolvedValueOnce({
        id: catalogId,
        oemId: 1,
      } as any);

      await expect(
        catalogService.validateCatalog(catalogId, userId),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return the catalog if it exists and the user is authorized', async () => {
      const catalogId = 1;
      const userId = 1;

      jest.spyOn(catalogService, 'findById').mockResolvedValueOnce({
        id: catalogId,
        oemId: userId,
      } as any);

      const result = await catalogService.validateCatalog(catalogId, userId);

      expect(result).toBeDefined();
      expect(result.id).toBe(catalogId);
      expect(result.oemId).toBe(userId);
    });
  });

  describe('validateCatalogProductParameters', () => {
    it('should throw a NotFoundException if catalog is not found', async () => {
      const catalogId = 1;
      const userId = 1;
      const productId = 1;

      jest.spyOn(catalogService, 'validateCatalog').mockImplementation(() => {
        throw new NotFoundException('catalog not found');
      });

      await expect(
        catalogService.validateCatalogProductParameters(
          catalogId,
          userId,
          productId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw a NotFoundException if product is not found', async () => {
      const catalogId = 1;
      const userId = 1;
      const productId = 1;

      jest
        .spyOn(catalogService, 'validateCatalog')
        .mockReturnValue({ id: catalogId, oemId: userId } as any);
      jest.spyOn(prismaService.product, 'findUnique').mockReturnValue(null);

      await expect(
        catalogService.validateCatalogProductParameters(
          catalogId,
          userId,
          productId,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return the product if it exists', async () => {
      const catalogId = 1;
      const userId = 1;
      const productId = 1;

      const product = {
        id: productId,
        name: 'Product',
        description: 'Product description',
        price: 10,
        logo: 'logo.png',
        picture: 'picture.png',
        catalogId,
      };

      jest
        .spyOn(catalogService, 'validateCatalog')
        .mockReturnValue({ id: catalogId, oemId: userId } as any);
      jest
        .spyOn(prismaService.product, 'findUnique')
        .mockReturnValue(product as any);

      const result = await catalogService.validateCatalogProductParameters(
        catalogId,
        userId,
        productId,
      );

      expect(result).toEqual(product);
    });
  });
});
