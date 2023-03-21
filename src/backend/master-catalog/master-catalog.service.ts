import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterProduct } from '@prisma/client';
import { omit } from 'lodash';
import { PrismaService } from 'src/prisma.service';
import { Assert } from '../utils/assert';

/**
 * Service responsible for managing the master catalog and its products.
 */
@Injectable()
export class MasterCatalogService {
  /**
   * Creates an instance of `MasterCatalogService`.
   * @param prismaService - The Prisma service instance to use for database access.
   */
  constructor(private prismaService: PrismaService) {}

  /**
   * Creates a new MasterProduct in the Master Catalog
   * @param masterProduct - The MasterProduct to create
   * @throws `BadRequestException` if a MasterProduct with the same partNumber already exists
   */
  async createProduct(masterProductRequest: MasterProduct) {
    const {
      name,
      description,
      price,
      logo,
      partNumber,
      picture,
      masterCatalogId,
    } = masterProductRequest;

    const masterProduct = {
      name,
      description,
      price,
      logo,
      partNumber,
      picture,
      masterCatalogId,
    };

    await this.validatePartNumber(masterProduct.partNumber);

    masterProduct.masterCatalogId = 1;
    return await this.prismaService.masterProduct.create({
      data: masterProduct,
    });
  }

  /**
   * Validates that a MasterProduct with the given partNumber does not exist
   * @param partNumber - The part number to validate
   * @throws `BadRequestException` if a MasterProduct with the same partNumber already exists
   */
  async validatePartNumber(partNumber: string) {
    const dbMasterProduct = await this.prismaService.masterProduct.findUnique({
      where: {
        partNumber: partNumber,
      },
    });

    Assert.assertFalse(
      dbMasterProduct,
      () => new BadRequestException('part number already exist'),
    );
  }

  /**
   * Retrieves all MasterProducts in the Master Catalog
   * @returns A list of MasterProducts
   */
  async find() {
    const masterCatalog = await this.prismaService.masterCatalog.findFirst({
      include: {
        masterProducts: true,
      },
    });
    return masterCatalog.masterProducts;
  }

  /**
   * Updates a MasterProduct in the Master Catalog
   * @param id - The id of the MasterProduct to update
   * @param masterProduct - The MasterProduct fields to update
   * @returns The updated MasterProduct
   * @throws `NotFoundException` if the MasterProduct with the given id does not exist
   */
  async updateProduct(id: number, masterProductRequest: MasterProduct) {
    const masterProduct = omit(masterProductRequest, [
      'id',
      'partNumber',
      'masterCatalog',
      'status',
      'updatedAt',
      'createdAt',
    ]);
    const dbMasterProduct = await this.prismaService.masterProduct.findUnique({
      where: {
        id,
      },
    });

    Assert.assertTrue(
      dbMasterProduct,
      () => new NotFoundException('master product not found'),
    );

    return this.prismaService.$transaction(async (tx) => {
      const persistData = { ...dbMasterProduct, ...masterProduct };
      if (masterProduct.price > dbMasterProduct.price) {
        await tx.product.updateMany({
          where: {
            price: {
              lt: masterProduct.price,
            },
            masterProductPartNumber: dbMasterProduct.partNumber,
          },
          data: {
            price: masterProduct.price,
          },
        });
      }

      const result = await tx.masterProduct.update({
        where: {
          id,
        },
        data: persistData,
      });

      return result;
    });
  }

  /**
   * Deletes a MasterProduct from the Master Catalog
   * @param id - The id of the MasterProduct to delete
   * @returns The deleted MasterProduct
   * @throws `NotFoundException` if the MasterProduct with the given id does not exist
   */
  async deleteProduct(id: number) {
    const dbMasterProduct = await this.prismaService.masterProduct.findUnique({
      where: {
        id,
      },
    });

    Assert.assertTrue(
      dbMasterProduct,
      () => new NotFoundException('master product not found'),
    );

    return this.prismaService.$transaction(async (tx) => {
      await tx.product.updateMany({
        where: {
          masterProductPartNumber: dbMasterProduct.partNumber,
        },
        data: {
          masterProductPartNumber: null,
        },
      });

      const result = await tx.masterProduct.delete({
        where: {
          id,
        },
      });

      return result;
    });
  }
}
