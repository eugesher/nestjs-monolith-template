import { SelectQueryBuilder } from 'typeorm';

import { UserStatusEnum } from '@acme-libs/kernel';
import { Customer } from '@acme-core/entities';

export class AuthGlobalPersistenceCustomerBuilder extends SelectQueryBuilder<Customer> {
  public forActiveById(id: string): this {
    this.select([`${this.alias}.id`, `${this.alias}.email`])
      .where(`${this.alias}.id = :id`, { id })
      .andWhere(`${this.alias}.status = :status`, { status: UserStatusEnum.ACTIVE });

    return this;
  }
}
