import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

import { UpdateMasterCatalogDto } from './dto/update-master-catalog.dto';

@Injectable()
export class MasterCatalogService {
  constructor(private prismaService: PrismaService) {}
  find() {
    return this.prismaService.masterCatalog.findFirst();
  }

  update(id: number, updateMasterCatalogDto: UpdateMasterCatalogDto) {
    return `This action updates a #${id} masterCatalog`;
  }
}
