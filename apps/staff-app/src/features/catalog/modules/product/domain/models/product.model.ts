import { ProductStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot, Maybe } from '@acme-libs/toolkit';

import { ProductCreatedEvent } from '../events/product-created.event';
import { ProductPublishedEvent } from '../events/product-published.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { ProductNameInvalidException } from '../exceptions/product-name-invalid.exception';
import { ProductSkuInvalidException } from '../exceptions/product-sku-invalid.exception';
import { ProductVersionInvalidException } from '../exceptions/product-version-invalid.exception';
import { IProductChanges } from '../interfaces/product-changes.interface';
import { IProductDraft } from '../interfaces/product-draft.interface';
import { IProductRecord } from '../interfaces/product-record.interface';
import { IProductSnapshot } from '../interfaces/product-snapshot.interface';

export class ProductModel extends AggregateRoot<Maybe<string>> {
  private static readonly SKU_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,63}$/;
  private static readonly NAME_MAX_LENGTH = 255;

  private constructor(
    id: Maybe<string>,
    public readonly sku: string,
    private currentName: string,
    private currentStatus: ProductStatusEnum,
    private currentVersion: number,
    public readonly createdAt: Maybe<Date>,
    public readonly updatedAt: Maybe<Date>,
  ) {
    super(id);
  }

  public static create(draft: IProductDraft): ProductModel {
    const { sku, name } = draft;
    const validSku = ProductModel.validSku(sku);
    const validName = ProductModel.validName(name);
    const product = new ProductModel(
      undefined,
      validSku,
      validName,
      ProductStatusEnum.DRAFT,
      1,
      undefined,
      undefined,
    );
    const event = new ProductCreatedEvent(undefined, product.sku, product.name);

    product.addDomainEvent(event);

    return product;
  }

  public static reconstitute(record: IProductRecord): ProductModel {
    const { id, sku, name, status, version, createdAt, updatedAt } = record;
    const validSku = ProductModel.validSku(sku);
    const validName = ProductModel.validName(name);
    const validVersion = ProductModel.validVersion(version);

    return new ProductModel(id, validSku, validName, status, validVersion, createdAt, updatedAt);
  }

  private static validSku(sku: string): string {
    if (!ProductModel.SKU_PATTERN.test(sku)) {
      throw new ProductSkuInvalidException(ProductModel.SKU_PATTERN, sku);
    }

    return sku;
  }

  private static validName(name: string): string {
    const trimmed = name.trim();

    if (trimmed.length === 0 || trimmed.length > ProductModel.NAME_MAX_LENGTH) {
      throw new ProductNameInvalidException(ProductModel.NAME_MAX_LENGTH);
    }

    return trimmed;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new ProductVersionInvalidException(version);
    }

    return version;
  }

  public get name(): string {
    return this.currentName;
  }

  public get status(): ProductStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  public update(changes: IProductChanges): void {
    const { name } = changes;

    if (name === undefined) {
      return;
    }

    const validName = ProductModel.validName(name);

    if (validName === this.currentName) {
      return;
    }

    const previousName = this.currentName;

    this.currentName = validName;
    this.currentVersion += 1;

    const event = new ProductUpdatedEvent(this.id, { name: validName }, { name: previousName });

    this.addDomainEvent(event);
  }

  public publish(): void {
    if (this.currentStatus === ProductStatusEnum.ACTIVE) {
      return;
    }

    const previousStatus = this.currentStatus;

    this.currentStatus = ProductStatusEnum.ACTIVE;
    this.currentVersion += 1;

    const event = new ProductPublishedEvent(this.id, this.sku, this.currentVersion, previousStatus);

    this.addDomainEvent(event);
  }

  public toView(): IProductSnapshot {
    const now = new Date();
    const createdAt = this.createdAt ?? now;
    const updatedAt = this.updatedAt ?? now;

    return {
      id: this.id ?? '',
      sku: this.sku,
      name: this.name,
      status: this.status,
      version: this.version,
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
  }
}
