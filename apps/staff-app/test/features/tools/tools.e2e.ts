import { AppE2EContext } from '../../context/app-e2e.context';
import { NoteE2E } from './modules/note.e2e';
import { ReminderE2E } from './modules/reminder.e2e';
import { TagE2E } from './modules/tag.e2e';

export class ToolsE2E {
  private constructor(
    private readonly noteE2E: NoteE2E,
    private readonly reminderE2E: ReminderE2E,
    private readonly tagE2E: TagE2E,
  ) {}

  public static of(ctx: AppE2EContext): ToolsE2E {
    return new ToolsE2E(NoteE2E.of(ctx), ReminderE2E.of(ctx), TagE2E.of(ctx));
  }

  public execute(): void {
    describe('Note', () => {
      this.noteE2E.handleGetMany();
      this.noteE2E.handleGetOne();
      this.noteE2E.handleGetRevisions();
      this.noteE2E.handleCreate();
      this.noteE2E.handleEdit();
      this.noteE2E.handleResolve();
    });

    describe('Reminder', () => {
      this.reminderE2E.hooks();
      this.reminderE2E.handleGetSummary();
      this.reminderE2E.handleGetMany();
      this.reminderE2E.handleCreate();
      this.reminderE2E.handleComplete();
      this.reminderE2E.handleReschedule();
      this.reminderE2E.handleDelete();
    });

    describe('Tag', () => {
      this.tagE2E.handleGetMany();
      this.tagE2E.handleCreate();
      this.tagE2E.handleRename();
      this.tagE2E.handleDelete();
    });
  }
}
