import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterProduct } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Assert } from '../utils/assert';

@Injectable()
export class MasterCatalogService {
  constructor(private prismaService: PrismaService) {}

  async createProduct(masterProduct: MasterProduct) {
    await this.validatePartNumber(masterProduct.partNumber);

    masterProduct.masterCatalogId = 1;
    return await this.prismaService.masterProduct.create({
      data: masterProduct,
    });
  }

  private async validatePartNumber(partNumber: string) {
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

  async find() {
    const masterCatalog = await this.prismaService.masterCatalog.findFirst({
      include: {
        masterProducts: true,
      },
    });
    return masterCatalog.masterProducts;
  }

  async updateProduct(id: number, masterProduct: MasterProduct) {
    const dbMasterProduct = await this.prismaService.masterProduct.findUnique({
      where: {
        id,
      },
    });

    Assert.assertTrue(
      dbMasterProduct,
      () => new NotFoundException('master product not found'),
    );

    if (dbMasterProduct.partNumber !== masterProduct.partNumber) {
      await this.validatePartNumber(masterProduct.partNumber);
    }

    return this.prismaService.$transaction(async (tx) => {
      const persistData = { ...dbMasterProduct, ...masterProduct };
      if (masterProduct.price > dbMasterProduct.price) {
        await tx.product.updateMany({
          where: {
            price: {
              lt: masterProduct.price,
            },
            masterProductPartNumber: masterProduct.partNumber,
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
