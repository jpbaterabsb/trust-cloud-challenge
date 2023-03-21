import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './auth/jwt.strategy';
import { MasterCatalogController } from './master-catalog/master-catalog.controller';
import { MasterCatalogService } from './master-catalog/master-catalog.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/role.guard';
import { CatalogController } from './catalog/catalog.controller';
import { CatalogService } from './catalog/catalog.service';

@Module({
  providers: [
    PrismaService,
    JwtStrategy,
    MasterCatalogService,
    CatalogService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.SECRET,
      signOptions: { expiresIn: '20y' },
    }),
  ],
  controllers: [MasterCatalogController, CatalogController],
})
export class BackendModule {}
