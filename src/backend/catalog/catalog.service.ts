import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Assert } from '../utils/assert';
import {
  AddCatalogProductDTO,
  AddCatalogProductWithoutMasterProductDTO,
} from './dto/create-catalog.dto';

import { Product } from '@prisma/client';
import { validate } from 'class-validator';
import { isNil, omit, omitBy } from 'lodash';
import { User } from '../auth/entities/user.dto';
import { UpdateCatalogProductDto } from './dto/update-catalog.dto';

/**
 * A service to manage catalog products.
 */
@Injectable()
export class CatalogService {
  /**
   * Creates a new `CatalogService` instance.
   * @param prismaService - A `PrismaService` instance.
   */
  constructor(private prismaService: PrismaService) {}

  /**
   * Creates a catalog product.
   * @param id - A number that represents the catalog ID.
   * @param user - A `User` object that represents the authenticated user.
   * @param addCatalogProductDTO - An `AddCatalogProductDTO` object that represents the catalog product to create.
   * @returns A `Promise` that resolves to the created `Product` object.
   * @throws `NotFoundException` if the catalog does not exist.
   * @throws `UnauthorizedException` if the authenticated user is not the owner of the catalog.
   */
  async createCatalogProduct(
    id: number,
    user: User,
    addCatalogProductDTO: AddCatalogProductDTO,
  ) {
    const catalog = await this.findById(id);

    Assert.assertTrue(
      catalog,
      () => new NotFoundException("the catalog doesn't exist"),
    );
    Assert.assertTrue(
      catalog.oemId === user.id,
      () => new UnauthorizedException(),
    );

    addCatalogProductDTO.catalogId = catalog.id;

    return this.createOrUpdateCatalogProduct(addCatalogProductDTO);
  }

  /**
   * Creates or updates a catalog product.
   * @param addCatalogProductDTO - An `AddCatalogProductDTO` object that represents the catalog product to create or update.
   * @returns A `Promise` that resolves to the created or updated `Product` object.
   * @throws `NotFoundException` if the master product does not exist.
   * @throws `UnprocessableEntityException` if the catalog product validation fails.
   */
  async createOrUpdateCatalogProduct(
    addCatalogProductDTO: AddCatalogProductDTO,
  ) {
    if (addCatalogProductDTO.masterProductPartNumber) {
      const masterProduct = await this.getMasterProductByPartNumber(
        addCatalogProductDTO.masterProductPartNumber,
      );

      Assert.assertTrue(
        masterProduct,
        () => new NotFoundException('master product not exist'),
      );

      Assert.assertTrue(
        !addCatalogProductDTO.price ||
          addCatalogProductDTO.price >= masterProduct.price,
        'master product price should be greater or equals of product',
      );

      const safeCatalogProduct = omitBy(addCatalogProductDTO, isNil);

      const persistProduct = omit({ ...masterProduct, ...safeCatalogProduct }, [
        'masterCatalogId',
        'partNumber',
      ]);

      const catalogProduct = await this.upsertCatalogProduct(
        persistProduct as any,
      );
      return catalogProduct;
    } else {
      await this.validateProductWithoutMasterProductReference(
        addCatalogProductDTO,
      );
      addCatalogProductDTO.masterProductPartNumber = null;
    }

    const catalogProduct = await this.upsertCatalogProduct(
      addCatalogProductDTO as any,
    );

    return catalogProduct;
  }

  /**
   * Gets a master product by part number.
   * @param masterProductPartNumber - A string that represents the master product part number.
   * @returns A `Promise` that resolves to the `MasterProduct` object.
   */
  async getMasterProductByPartNumber(masterProductPartNumber: string) {
    return await this.prismaService.masterProduct.findFirst({
      where: {
        partNumber: masterProductPartNumber,
      },
    });
  }

  /**
   * Validates a product without a master product reference.
   * @param addCatalogProductDTO - An `AddCatalogProductDTO` object that represents the catalog product to validate.
   * @throws `UnprocessableEntityException` if the validation fails.
   */
  async validateProductWithoutMasterProductReference(
    addCatalogProductDTO: AddCatalogProductDTO,
  ) {
    const addCatalogProductWithoutMasterProductDTO =
      new AddCatalogProductWithoutMasterProductDTO();

    addCatalogProductWithoutMasterProductDTO.description =
      addCatalogProductDTO.description;
    addCatalogProductWithoutMasterProductDTO.name = addCatalogProductDTO.name;
    addCatalogProductWithoutMasterProductDTO.price = addCatalogProductDTO.price;

    const validation = await validate(addCatalogProductWithoutMasterProductDTO);

    Assert.assertEmpty(
      validation,
      () =>
        new UnprocessableEntityException(
          validation.map((v) => ({
            property: v.property,
            constraints: v.constraints,
          })),
        ),
    );
  }

  /**
   * Updates a catalog product.
   * @param product - An `UpdateCatalogProductDto` object that represents the catalog product to update.
   * @param productId - A number that represents the product ID.
   * @param catalogId - A number that represents the catalog ID.
   * @param userId - A number that represents the user ID.
   * @returns A `Promise` that resolves to the updated `Product` object.
   * @throws `UnprocessableEntityException` if the catalog product validation fails.
   */
  async updateCatalogProduct(
    product: UpdateCatalogProductDto,
    productId: number,
    catalogId: number,
    userId: number,
  ) {
    await this.validateCatalogProductParameters(catalogId, userId, productId);

    product.catalogId = catalogId;
    product.id = productId;

    return this.createOrUpdateCatalogProduct(product as AddCatalogProductDTO);
  }

  /**
   * Gets products by catalog ID.
   * @param catalogId - A number that represents the catalog ID.
   * @param userId - A number that represents the user ID.
   * @param page - A number that represents the page number.
   * @param limit - A number that represents the number of items to return.
   * @returns A `Promise` that resolves to an array of `Product` objects.
   */
  async getProductsByCatalogId(
    catalogId: number,
    userId: number,
    page: number,
    limit: number,
  ) {
    await this.validateCatalog(catalogId, userId);
    const skip = (page - 1) * limit;
    return this.prismaService.product.findMany({
      where: {
        catalogId,
      },
      skip,
      take: limit,
    });
  }

  /**
   * Returns a product from a catalog by its ID and the catalog ID.
   * @param productId The ID of the product to retrieve.
   * @param catalogId The ID of the catalog containing the product.
   * @param userId The ID of the user making the request.
   * @returns The product with the specified ID and catalog ID.
   */
  async getProductFromACatalog(
    productId: number,
    catalogId: number,
    userId: number,
  ) {
    return this.validateCatalogProductParameters(catalogId, userId, productId);
  }

  /**
   * Returns the master catalog for the given catalog ID and user ID.
   * @param catalogId The ID of the catalog to retrieve the master catalog for.
   * @param userId The ID of the user making the request.
   * @returns The master catalog for the specified catalog ID and user ID.
   */
  async getMasterCatalog(catalogId: number, userId: number) {
    await this.validateCatalog(catalogId, userId);
    const catalog = await this.prismaService.catalog.findFirst({
      where: { id: catalogId },
      include: {
        masterCatalog: {
          include: { masterProducts: true },
        },
      },
    });

    const master = catalog.masterCatalog as any;
    master.products = master.masterProducts;
    master.masterProducts = undefined;
    return catalog.masterCatalog;
  }

  /**
   * Deletes a catalog product with the specified ID, catalog ID, and user ID.
   * @param productId The ID of the product to delete.
   * @param catalogId The ID of the catalog containing the product.
   * @param userId The ID of the user making the request.
   * @returns Nothing.
   */
  async deleteCatalogProduct(
    productId: number,
    catalogId: number,
    userId: number,
  ) {
    await this.validateCatalogProductParameters(catalogId, userId, productId);

    await this.prismaService.product.delete({
      where: {
        id: productId,
      },
    });
    return;
  }

  /**
   * Validates the catalog ID, user ID, and product ID, and returns the corresponding product.
   * @param catalogId The ID of the catalog containing the product.
   * @param userId The ID of the user making the request.
   * @param productId The ID of the product to retrieve.
   * @returns The product with the specified ID and catalog ID.
   */
  async validateCatalogProductParameters(
    catalogId: number,
    userId: number,
    productId: number,
  ) {
    await this.validateCatalog(catalogId, userId);

    const dbProduct = await this.prismaService.product.findUnique({
      where: { id: productId },
    });

    Assert.assertTrue(
      dbProduct,
      () => new NotFoundException('product not found'),
    );
    return dbProduct;
  }

  /**
   * Validates the catalog ID and user ID, and returns the corresponding catalog.
   * @param catalogId The ID of the catalog to retrieve.
   * @param userId The ID of the user making the request.
   * @returns The catalog with the specified ID.
   */
  async validateCatalog(catalogId: number, userId: number) {
    const catalog = await this.findById(catalogId);

    Assert.assertTrue(
      catalog,
      () => new NotFoundException('catalog not found'),
    );
    Assert.assertTrue(
      catalog.oemId === userId,
      () => new UnauthorizedException(),
    );
    return catalog;
  }

  /**
   * Finds a catalog by its ID.
   * @param id The ID of the catalog to find.
   * @returns The catalog with the specified ID.
   */
  async findById(id: number) {
    const catalog = await this.prismaService.catalog.findFirst({
      where: {
        id: Number(id),
      },
    });
    return catalog;
  }

  /**
   * Upserts a catalog product by either creating a new one or updating an existing one.
   * @param {Product} persistProduct - The product to be persisted in the database.
   * @returns {Promise<Product>} - A promise that resolves to the upserted catalog product.
   */
  async upsertCatalogProduct(persistProduct: Product) {
    const catalogProduct = await this.prismaService.product.upsert({
      where: { id: persistProduct.id || 0 },
      create: persistProduct,
      update: persistProduct,
    });
    return catalogProduct;
  }
}
