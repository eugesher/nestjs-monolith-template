import { ReminderModel } from '../../domain';
import { IReminderView } from '../interfaces/views/reminder.view';

export class ReminderViewMapper {
  public static toView(reminder: ReminderModel): IReminderView {
    const now = new Date();
    const createdAt = reminder.createdAt ?? now;
    const updatedAt = reminder.updatedAt ?? now;

    return {
      id: reminder.id ?? '',
      ownerId: reminder.ownerId,
      title: reminder.title,
      body: reminder.body,
      dueOn: reminder.dueOn,
      status: reminder.status,
      version: reminder.version,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
