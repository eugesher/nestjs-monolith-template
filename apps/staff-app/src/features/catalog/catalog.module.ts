import { Module } from '@nestjs/common';

import { ProductModule } from './modules';

@Module({
  imports: [ProductModule],
})
export class CatalogModule {}
