import { TypeOrmModuleOptions } from '@nestjs/typeorm';

import { Customer } from '@acme-core/entities';

export const entities: TypeOrmModuleOptions['entities'] = [Customer];
