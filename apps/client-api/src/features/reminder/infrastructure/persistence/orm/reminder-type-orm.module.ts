import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Reminder } from '@acme-core/entities';

export class ReminderTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Reminder]);
  }
}
