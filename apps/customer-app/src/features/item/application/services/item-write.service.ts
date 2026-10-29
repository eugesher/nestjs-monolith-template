import { Inject, Injectable } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import { OccRetryHelper } from '@acme-libs/toolkit';
import { ItemDomainException, ItemErrorCodeEnum, ItemHelper, ItemModel } from '../../domain';
import {
  type IItemWriteRepositoryPort,
  ITEM_OCC_RETRY_ATTEMPTS,
  ITEM_WRITE_REPOSITORY_PORT,
} from '../../outbound';
import { ItemWriteConflictError } from '../errors/item-write-conflict.error';
import { IItemWriteCommand } from '../interfaces/commands/item-write.command';
import { IItemWriteView } from '../interfaces/views/item-write.view';
import { ItemAccessService } from './item-access.service';

@Injectable()
export class ItemWriteService {
  constructor(
    private readonly accessService: ItemAccessService,
    @Inject(ITEM_WRITE_REPOSITORY_PORT)
    private readonly repository: IItemWriteRepositoryPort,
    @Inject(ITEM_OCC_RETRY_ATTEMPTS)
    private readonly occRetryAttempts: number,
    @InjectPinoLogger(ItemWriteService.name)
    private readonly logger: PinoLogger,
  ) {}

  public write(
    command: IItemWriteCommand,
    mutate: (item: ItemModel) => void,
  ): Promise<IItemWriteView> {
    const { itemId, expectedVersion } = command;
    const maxAttempts = expectedVersion === undefined ? this.occRetryAttempts : 1;

    return OccRetryHelper.run(() => this.attempt(command, mutate), {
      subject: 'Item',
      logger: this.logger,
      maxAttempts,
      isConflict: (error): error is ItemWriteConflictError =>
        error instanceof ItemWriteConflictError,
      retryContext: (conflict) => ({ itemId, currentVersion: conflict.currentVersion }),
      exhaustedContext: () => ({ itemId }),
      onExhausted: (conflict, attempts) => {
        throw new ItemDomainException(
          ItemErrorCodeEnum.ITEM_VERSION_MISMATCH,
          `Item ${itemId} write lost the optimistic race after ${attempts} attempts`,
          { currentVersion: conflict.currentVersion },
        );
      },
    });
  }

  private async attempt(
    command: IItemWriteCommand,
    mutate: (item: ItemModel) => void,
  ): Promise<IItemWriteView> {
    const { itemId, ownerId, expectedVersion } = command;
    const item = await this.accessService.loadOwned({ itemId, ownerId });

    ItemHelper.assertExpectedVersion(item, expectedVersion);

    const versionAsRead = item.version;

    mutate(item);

    const events = item.pullDomainEvents();

    if (item.version === versionAsRead) {
      return { item, events };
    }

    const updated = await this.repository.update({ item, versionAsRead });

    if (!updated) {
      const current = await this.load(itemId);

      throw new ItemWriteConflictError(itemId, current.version);
    }

    const saved = await this.load(itemId);

    return { item: saved, events };
  }

  private async load(itemId: string): Promise<ItemModel> {
    const item = await this.repository.findById(itemId);

    if (item === null) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_NOT_FOUND,
        `Item ${itemId} was not found`,
      );
    }

    return item;
  }
}
