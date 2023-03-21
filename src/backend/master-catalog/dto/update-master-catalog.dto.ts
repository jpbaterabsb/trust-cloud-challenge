import { PartialType } from '@nestjs/swagger';
import { CreateMasterCatalogDto } from './create-master-catalog.dto';

export class UpdateMasterCatalogDto extends PartialType(CreateMasterCatalogDto) {}
