import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BackendModule } from './backend/backend.module';

@Module({
  imports: [BackendModule, ConfigModule.forRoot()],
})
export class AppModule {}
