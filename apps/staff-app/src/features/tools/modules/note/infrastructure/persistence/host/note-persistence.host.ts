import { Note, NoteRevision } from '@acme-staff/common/entities';
import type { IHostedRepository, IOrmPort } from '@acme-libs/contracts/database';

import { NotePersistenceNoteRevisionBuilder } from '../builders/note-persistence-note-revision.builder';
import { NotePersistenceBuilder } from '../builders/note-persistence.builder';

export abstract class NotePersistenceHost {
  protected abstract readonly orm: IOrmPort;

  protected get noteRepository(): IHostedRepository<Note> {
    return this.orm.getRepository(Note);
  }

  protected get noteRevisionRepository(): IHostedRepository<NoteRevision> {
    return this.orm.getRepository(NoteRevision);
  }

  protected createNoteBuilder(): NotePersistenceBuilder {
    return new NotePersistenceBuilder(this.noteRepository.createQueryBuilder(Note.name));
  }

  protected createNoteRevisionBuilder(): NotePersistenceNoteRevisionBuilder {
    return new NotePersistenceNoteRevisionBuilder(
      this.noteRevisionRepository.createQueryBuilder(NoteRevision.name),
    );
  }
}
