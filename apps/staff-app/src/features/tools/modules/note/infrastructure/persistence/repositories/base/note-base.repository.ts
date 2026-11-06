import { INoteEditUpdateQuery } from '../../../../outbound';
import { NotePersistenceHost } from '../../host/note-persistence.host';

export abstract class NoteBaseRepository extends NotePersistenceHost {
  public async update(query: INoteEditUpdateQuery): Promise<boolean> {
    const { id, versionAsRead, body, resolved, version } = query;
    const result = await this.noteRepository.update(
      { id, version: versionAsRead },
      { body, resolved, version },
    );

    return result.affected === 1;
  }
}
