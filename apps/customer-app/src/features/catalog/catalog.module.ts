import { Module } from '@nestjs/common';

import { CatalogGetManyUseCase } from './application';
import { CatalogCrudRepository, CatalogTypeOrmModule } from './infrastructure';
import { CATALOG_CRUD_REPOSITORY_PORT } from './outbound';
import { CatalogController } from './presentation';

@Module({
  imports: [CatalogTypeOrmModule.forFeature()],
  controllers: [CatalogController],
  providers: [
    CatalogGetManyUseCase,
    { provide: CATALOG_CRUD_REPOSITORY_PORT, useClass: CatalogCrudRepository },
  ],
})
export class CatalogModule {}
