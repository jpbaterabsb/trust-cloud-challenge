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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { Role } from '../auth/entities/roles';
import { User } from '../auth/entities/user.dto';
import { Roles } from '../auth/roles.decorator';
import { CatalogService } from './catalog.service';
import { AddCatalogProductDTO } from './dto/create-catalog.dto';

@Controller('catalogs')
@ApiTags('Catalog')
@ApiBearerAuth()
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @ApiOperation({ summary: 'Create a catalog product' })
  @ApiResponse({
    status: 201,
    description: 'The catalog product has been successfully created.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiBody({
    description: 'Request body for creating a catalog product',
    type: AddCatalogProductDTO,
  })
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

  @ApiOperation({
    summary: 'Update a product in a catalog',
  })
  @ApiBody({
    type: AddCatalogProductDTO,
    description: 'Updated product data',
  })
  @ApiResponse({
    status: 200,
    description: 'The updated product',
    type: AddCatalogProductDTO,
  })
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
      +productId,
      +catalogId,
      user.id,
    );
  }

  @ApiNoContentResponse({
    description: 'The catalog product has been deleted.',
  })
  @ApiOperation({ summary: 'Delete a product from a catalog' })
  @ApiBadRequestResponse({ description: 'Invalid request.' })
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
  @ApiParam({
    name: 'catalogId',
    description: 'ID of the catalog to retrieve products from',
    type: Number,
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number of the products to retrieve',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of products to retrieve per page',
    required: false,
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'List of products in the catalog',
    type: [AddCatalogProductDTO],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiOperation({
    summary: 'Get products from a catalog',
    description:
      'Retrieves a list of products from a catalog based on the specified catalog ID',
  })
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
  @ApiOkResponse({ description: 'Product retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Product not found' })
  @ApiOperation({ summary: 'Get a product from a catalog' })
  async getProductFromACatalog(
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

  @ApiOkResponse({ description: 'Master catalog retrieved successfully' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiNotFoundResponse({ description: 'Master catalog not found' })
  @ApiOperation({ summary: 'Get master catalog by catalog ID' })
  @Get(':catalogId/master-catalogs')
  @Roles(Role.OEM)
  async getMasterCatalog(
    @CurrentUser() user: User,
    @Param('catalogId') catalogId: number,
  ) {
    return this.catalogService.getMasterCatalog(Number(catalogId), user.id);
  }
}
