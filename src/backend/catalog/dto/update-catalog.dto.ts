import { PartialType } from '@nestjs/swagger';
import { AddCatalogProductDTO } from './create-catalog.dto';

export class UpdateCatalogProductDto extends PartialType(
  AddCatalogProductDTO,
) {}
