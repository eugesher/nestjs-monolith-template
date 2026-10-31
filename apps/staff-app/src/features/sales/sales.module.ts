import { Module } from '@nestjs/common';

import { OrderModule } from './modules';

@Module({
  imports: [OrderModule],
})
export class SalesModule {}
