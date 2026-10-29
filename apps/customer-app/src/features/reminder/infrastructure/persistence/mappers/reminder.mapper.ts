import { Reminder } from '@acme-core/entities';
import { ReminderModel } from '../../../domain';

export class ReminderMapper {
  public static toModel(entity: Reminder): ReminderModel {
    return ReminderModel.reconstitute({
      id: entity.id,
      ownerId: entity.ownerId,
      title: entity.title,
      body: entity.body,
      dueOn: entity.dueOn,
      status: entity.status,
      version: entity.version,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
