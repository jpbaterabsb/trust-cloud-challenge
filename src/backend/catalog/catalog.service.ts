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
import { UpdateCatalogProductDto } from './dto/update-catalog.dto';
import { User } from '../auth/entities/user.dto';

@Injectable()
export class CatalogService {
  constructor(private prismaService: PrismaService) {}

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

  async createOrUpdateCatalogProduct(
    addCatalogProductDTO: AddCatalogProductDTO,
  ) {
    if (addCatalogProductDTO.masterProductPartNumber) {
      const masterProduct = await this.prismaService.masterProduct.findFirst({
        where: {
          partNumber: addCatalogProductDTO.masterProductPartNumber,
        },
      });

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

  private async validateProductWithoutMasterProductReference(
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

  async getProductFromACatalog(
    productId: number,
    catalogId: number,
    userId: number,
  ) {
    return this.validateCatalogProductParameters(catalogId, userId, productId);
  }

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

  private async validateCatalogProductParameters(
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

  private async validateCatalog(catalogId: number, userId: number) {
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

  async findById(id: number) {
    const catalog = await this.prismaService.catalog.findFirst({
      where: {
        id: Number(id),
      },
    });
    return catalog;
  }

  private async upsertCatalogProduct(persistProduct: Product) {
    const catalogProduct = await this.prismaService.product.upsert({
      where: { id: persistProduct.id || 0 },
      create: persistProduct,
      update: persistProduct,
    });
    return catalogProduct;
  }
}
