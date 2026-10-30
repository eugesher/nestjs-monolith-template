import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Customer, Order, OrderProduct, Product, ProductStock } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [
  Customer,
  Order,
  OrderProduct,
  Product,
  ProductStock,
];
