import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { validate } from 'class-validator';
import { Role } from '../auth/entities/roles';
import { Roles } from '../auth/roles.decorator';
import { Assert } from '../utils/assert';
import { CreateMasterCatalogProductDto } from './dto/create-master-catalog.dto';
import { MasterCatalog } from './entities/master-catalog.entity';
import { MasterCatalogService } from './master-catalog.service';

@Controller('master-catalog')
@ApiTags('Master Catalog')
@ApiBearerAuth()
export class MasterCatalogController {
  constructor(private readonly masterCatalogService: MasterCatalogService) {}

  @Get('products')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all products in the master catalog' })
  @ApiResponse({
    status: 200,
    description: 'An array of products',
    type: [MasterCatalog],
  })
  findAll() {
    return this.masterCatalogService.find();
  }

  @Put('products/:id')
  @ApiOperation({ summary: 'Update a product in the master catalog by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'The updated product',
  })
  async update(
    @Param('id') id: string,
    @Body() updateMasterCatalogDto: CreateMasterCatalogProductDto,
  ) {
    const validation = await validate(updateMasterCatalogDto);
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
    return this.masterCatalogService.updateProduct(
      +id,
      updateMasterCatalogDto as any,
    );
  }

  @Post('products')
  @ApiOperation({ summary: 'Create a new product in the master catalog' })
  @ApiResponse({
    status: 201,
    description: 'The created product',
  })
  @ApiBody({
    description:
      'The request body should contain all required fields to create a new Master Catalog Product',
    type: CreateMasterCatalogProductDto,
  })
  async create(@Body() createProductDTO: CreateMasterCatalogProductDto) {
    const validation = await validate(createProductDTO);
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
    return this.masterCatalogService.createProduct(createProductDTO as any);
  }

  @Delete('products/:id')
  @ApiOperation({ summary: 'Delete a product from the master catalog by ID' })
  @ApiParam({ name: 'id', type: 'string', description: 'Product ID' })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  async delete(@Param('id') id: string) {
    return this.masterCatalogService.deleteProduct(+id);
  }
}
