import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '../auth/entities/roles';
import { User } from '../auth/entities/user.dto';
import { Roles } from '../auth/roles.decorator';
import { CatalogService } from './catalog.service';
import { AddCatalogProductDTO } from './dto/create-catalog.dto';

@Controller('catalogs')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post(':catalogId/products')
  @Roles(Role.OEM)
  async create(
    @Body() addCatalogProductDTO: AddCatalogProductDTO,
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
  ) {
    return await this.catalogService.createCatalogProduct(
      catalogId,
      user,
      addCatalogProductDTO,
    );
  }

  @Put(':catalogId/products/:productId')
  @Roles(Role.OEM)
  async update(
    @Body() addCatalogProductDTO: AddCatalogProductDTO,
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
    @Param('productId') productId: number,
  ) {
    return this.catalogService.updateCatalogProduct(
      addCatalogProductDTO,
      Number(productId),
      productId,
      user.id,
    );
  }

  @Delete(':catalogId/products/:productId')
  @Roles(Role.OEM)
  @HttpCode(204)
  async delete(
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
    @Param('productId') productId: number,
  ) {
    await this.catalogService.deleteCatalogProduct(
      Number(productId),
      Number(catalogId),
      user.id,
    );
    return;
  }

  @Get(':catalogId/products')
  @Roles(Role.OEM)
  async getCatalogProducts(
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.catalogService.getProductsByCatalogId(
      Number(catalogId),
      user.id,
      page,
      limit,
    );
  }

  @Get(':catalogId/products/:productId')
  @Roles(Role.OEM)
  async getProductFromACatalof(
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
    @Param('productId') productId: number,
  ) {
    return this.catalogService.getProductFromACatalog(
      Number(productId),
      Number(catalogId),
      user.id,
    );
  }

  @Get(':catalogId/master-catalogs')
  @Roles(Role.OEM)
  async getMasterCatalog(
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
  ) {
    return this.catalogService.getMasterCatalog(Number(catalogId), user.id);
  }
}
