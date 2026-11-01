import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Note, NoteRevision } from '@acme-core/entities';

export class NoteTypeOrmModule {
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature([Note, NoteRevision]);
  }
}
