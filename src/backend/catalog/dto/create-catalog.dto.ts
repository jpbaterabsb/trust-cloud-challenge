import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddCatalogProductDTO {
  @ApiProperty({
    example: 1,
    description: 'The ID',
  })
  id?: number;

  @ApiProperty({
    example: 1,
    description: 'The ID of the catalog the product belongs to',
  })
  catalogId: number;

  @ApiProperty({
    example: 'Product name',
    description: 'The name of the product',
  })
  name?: string;

  @ApiProperty({
    example: 'Product description',
    description: 'The description of the product',
  })
  description?: string;

  @ApiProperty({ example: 10.99, description: 'The price of the product' })
  price?: number;

  @ApiProperty({
    example: 'Product logo URL',
    description: 'The URL of the product logo',
  })
  logo?: string;

  @ApiProperty({
    example: 'Product picture URL',
    description: 'The URL of the product picture',
  })
  picture?: string;

  @ApiProperty({
    example: 'Master product part number',
    description: 'The part number of the master product',
  })
  masterProductPartNumber?: string;
}

export class AddCatalogProductWithoutMasterProductDTO extends AddCatalogProductDTO {
  @ApiProperty({
    example: 'Product Name',
    description: 'The name of the product',
    required: true,
  })
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Product Description',
    description: 'The description of the product',
    required: true,
  })
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    example: 9.99,
    description: 'The price of the product',
    required: true,
  })
  @IsNumber()
  price: number;
}
