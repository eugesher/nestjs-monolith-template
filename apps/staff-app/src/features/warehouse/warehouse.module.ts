import { Module } from '@nestjs/common';

import { ProductStockModule } from './modules';

@Module({
  imports: [ProductStockModule],
})
export class WarehouseModule {}
