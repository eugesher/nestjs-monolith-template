import { IHostedRepository, IRepositoryHostPort } from '@acme-libs/contracts/database';
import { Note, NoteRevision } from '@acme-staff/common/entities';
import { NotePersistenceBuilder } from '../builders/note-persistence.builder';
import { NotePersistenceNoteRevisionBuilder } from '../builders/note-persistence-note-revision.builder';

export abstract class NotePersistenceHost {
  protected abstract readonly repositoryHost: IRepositoryHostPort;

  protected get noteRepository(): IHostedRepository<Note> {
    return this.repositoryHost.getRepository(Note);
  }

  protected get noteRevisionRepository(): IHostedRepository<NoteRevision> {
    return this.repositoryHost.getRepository(NoteRevision);
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
