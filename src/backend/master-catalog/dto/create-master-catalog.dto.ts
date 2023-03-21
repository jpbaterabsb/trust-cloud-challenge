import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
export class CreateMasterCatalogProductDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The part number of the Master Catalog Product',
    type: String,
  })
  partNumber: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the Master Catalog Product',
    type: String,
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the Master Catalog Product',
    type: String,
  })
  description: string;

  @IsNumber()
  @ApiProperty({
    description: 'The price of the Master Catalog Product',
    type: Number,
  })
  price: number;

  @ApiProperty({
    description: 'The logo of the Master Catalog Product',
    type: String,
  })
  logo: string | null;

  @ApiProperty({
    description: 'The picture of the Master Catalog Product',
    type: String,
  })
  picture: string | null;
}

export class UpdateMasterCatalogProductDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'The name of the Master Catalog Product',
    type: String,
  })
  name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The description of the Master Catalog Product',
    type: String,
  })
  description: string;

  @IsNumber()
  @ApiProperty({
    description: 'The price of the Master Catalog Product',
    type: Number,
  })
  price: number;

  @ApiProperty({
    description: 'The logo of the Master Catalog Product',
    type: String,
  })
  logo: string | null;

  @ApiProperty({
    description: 'The picture of the Master Catalog Product',
    type: String,
  })
  picture: string | null;
}
