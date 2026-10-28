import { ReminderModel } from '../../../domain';

export interface IReminderWriteUpdateCommand {
  reminder: ReminderModel;
  versionAsRead: number;
}
