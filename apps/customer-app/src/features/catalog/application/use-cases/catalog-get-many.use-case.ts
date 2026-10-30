import { Inject, Injectable } from '@nestjs/common';

import { IPage, PaginationHelper } from '@acme-libs/toolkit';
import { CATALOG_CRUD_REPOSITORY_PORT, type ICatalogCrudRepositoryPort } from '../../outbound';
import { ICatalogGetManyQuery, ICatalogProductView } from '../interfaces';

@Injectable()
export class CatalogGetManyUseCase {
  constructor(
    @Inject(CATALOG_CRUD_REPOSITORY_PORT)
    private readonly repository: ICatalogCrudRepositoryPort,
  ) {}

  public execute(query: ICatalogGetManyQuery): Promise<IPage<ICatalogProductView>> {
    const { page, size } = query;
    const window = PaginationHelper.clampPageWindow(page, size);

    return this.repository.list({ ...window });
  }
}
