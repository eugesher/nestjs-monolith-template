import { ItemStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot, Maybe } from '@acme-libs/toolkit';
import { ItemErrorCodeEnum } from '../enums/item-error-code.enum';
import { ItemArchivedEvent } from '../events/item-archived.event';
import { ItemCreatedEvent } from '../events/item-created.event';
import { ItemRenamedEvent } from '../events/item-renamed.event';
import { ItemDomainException } from '../exceptions/item-domain.exception';
import { IItemDraft } from '../interfaces/item-draft.interface';
import { IItemRecord } from '../interfaces/item-record.interface';

export class ItemModel extends AggregateRoot<Maybe<string>> {
  private static readonly SKU_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,63}$/;
  private static readonly NAME_MAX_LENGTH = 255;

  private constructor(
    id: Maybe<string>,
    public readonly sku: string,
    private currentName: string,
    public readonly ownerId: string,
    private currentStatus: ItemStatusEnum,
    private currentVersion: number,
    public readonly createdAt: Maybe<Date>,
    public readonly updatedAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static create(draft: IItemDraft): ItemModel {
    const { sku, name, ownerId } = draft;
    const validSku = ItemModel.validSku(sku);
    const validName = ItemModel.validName(name);
    const item = new ItemModel(
      undefined,
      validSku,
      validName,
      ownerId,
      ItemStatusEnum.DRAFT,
      1,
      undefined,
      undefined,
    );
    const event = new ItemCreatedEvent(undefined, item.sku, item.name, item.ownerId);

    item.addDomainEvent(event);

    return item;
  }

  public static reconstitute(record: IItemRecord): ItemModel {
    const { id, sku, name, ownerId, status, version, createdAt, updatedAt } = record;
    const validSku = ItemModel.validSku(sku);
    const validName = ItemModel.validName(name);
    const validVersion = ItemModel.validVersion(version);

    return new ItemModel(
      id,
      validSku,
      validName,
      ownerId,
      status,
      validVersion,
      createdAt,
      updatedAt,
    );
  }

  private static validSku(sku: string): string {
    if (!ItemModel.SKU_PATTERN.test(sku)) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_SKU_INVALID,
        `Item.sku must match ${String(ItemModel.SKU_PATTERN)}, got ${sku}`,
      );
    }

    return sku;
  }

  private static validName(name: string): string {
    const trimmed = name.trim();

    if (trimmed.length === 0 || trimmed.length > ItemModel.NAME_MAX_LENGTH) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_NAME_INVALID,
        `Item.name must be a non-empty string of at most ${ItemModel.NAME_MAX_LENGTH} characters`,
      );
    }

    return trimmed;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_VERSION_INVALID,
        `Item.version must be a positive integer, got ${version}`,
      );
    }

    return version;
  }

  public get name(): string {
    return this.currentName;
  }

  public get status(): ItemStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public rename(name: string): void {
    this.assertNotArchived();

    const validName = ItemModel.validName(name);

    if (validName === this.currentName) {
      return;
    }

    const previousName = this.currentName;

    this.currentName = validName;
    this.currentVersion += 1;

    const event = new ItemRenamedEvent(this.id, validName, previousName);

    this.addDomainEvent(event);
  }

  public activate(): void {
    this.assertNotArchived();

    if (this.currentStatus === ItemStatusEnum.ACTIVE) {
      return;
    }

    this.currentStatus = ItemStatusEnum.ACTIVE;
    this.currentVersion += 1;
  }

  public archive(): void {
    this.assertNotArchived();

    const previousStatus = this.currentStatus;

    this.currentStatus = ItemStatusEnum.ARCHIVED;
    this.currentVersion += 1;

    const event = new ItemArchivedEvent(this.id, previousStatus);

    this.addDomainEvent(event);
  }

  private assertNotArchived(): void {
    if (this.currentStatus === ItemStatusEnum.ARCHIVED) {
      throw new ItemDomainException(
        ItemErrorCodeEnum.ITEM_ALREADY_ARCHIVED,
        `Item ${String(this.id)} is archived and can no longer be modified`,
      );
    }
  }
}
