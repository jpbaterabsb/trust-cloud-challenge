import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/entities/roles';
import { UpdateMasterCatalogDto } from './dto/update-master-catalog.dto';
import { MasterCatalogService } from './master-catalog.service';

@Controller('master-catalog')
export class MasterCatalogController {
  constructor(private readonly masterCatalogService: MasterCatalogService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.masterCatalogService.find();
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateMasterCatalogDto: UpdateMasterCatalogDto,
  ) {
    return this.masterCatalogService.update(+id, updateMasterCatalogDto);
  }
}
