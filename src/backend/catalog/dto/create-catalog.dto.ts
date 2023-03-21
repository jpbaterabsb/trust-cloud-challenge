import { IsNotEmpty, IsNumber } from 'class-validator';

export class AddCatalogProductDTO {
  id?: number;
  name?: string;
  description?: string;
  price?: number;
  logo?: string;
  picture?: string;
  masterProductPartNumber?: string;
  catalogId: number;
}

export class AddCatalogProductWithoutMasterProductDTO extends AddCatalogProductDTO {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  description: string;
  @IsNumber()
  price: number;
}
