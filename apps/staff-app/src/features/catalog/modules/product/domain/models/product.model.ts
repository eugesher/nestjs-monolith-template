import { ProductStatusEnum } from '@acme-libs/kernel';
import { AggregateRootBase } from '@acme-libs/toolkit';

import { ProductPublishedEvent } from '../events/product-published.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { ProductNameInvalidException } from '../exceptions/product-name-invalid.exception';
import { ProductSkuInvalidException } from '../exceptions/product-sku-invalid.exception';
import { ProductVersionInvalidException } from '../exceptions/product-version-invalid.exception';
import type {
  IProductCandidateInput,
  IProductChangesInput,
  IProductDraftOutput,
  IProductRecordInput,
  IProductSnapshotOutput,
} from '../interfaces';

export class ProductModel extends AggregateRootBase<string> {
  public get name(): string {
    return this.currentName;
  }

  public get status(): ProductStatusEnum {
    return this.currentStatus;
  }

  public get version(): number {
    return this.currentVersion;
  }

  private static readonly SKU_PATTERN = /^[A-Z0-9][A-Z0-9-]{2,63}$/;
  private static readonly NAME_MAX_LENGTH = 255;

  private constructor(
    id: string,
    public readonly sku: string,
    private currentName: string,
    private currentStatus: ProductStatusEnum,
    private currentVersion: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {
    super(id);
  }

  public static reconstitute(record: IProductRecordInput): ProductModel {
    const { id, sku, name, status, version, createdAt, updatedAt } = record;
    const validSku = ProductModel.validSku(sku);
    const validName = ProductModel.validName(name);
    const validVersion = ProductModel.validVersion(version);

    return new ProductModel(id, validSku, validName, status, validVersion, createdAt, updatedAt);
  }

  public static createDraft(candidate: IProductCandidateInput): IProductDraftOutput {
    const { sku, name } = candidate;
    const validSku = ProductModel.validSku(sku);
    const validName = ProductModel.validName(name);

    return { sku: validSku, name: validName, status: ProductStatusEnum.DRAFT, version: 1 };
  }

  public update(changes: IProductChangesInput): void {
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

    const updatedEvent = new ProductUpdatedEvent(
      this.id,
      { name: validName },
      { name: previousName },
    );

    this.addDomainEvent(updatedEvent);
  }

  public publish(): void {
    if (this.currentStatus === ProductStatusEnum.ACTIVE) {
      return;
    }

    const previousStatus = this.currentStatus;

    this.currentStatus = ProductStatusEnum.ACTIVE;
    this.currentVersion += 1;

    const publishedEvent = new ProductPublishedEvent(
      this.id,
      this.sku,
      this.currentVersion,
      previousStatus,
    );

    this.addDomainEvent(publishedEvent);
  }

  public toSnapshot(): IProductSnapshotOutput {
    return {
      id: this.id,
      sku: this.sku,
      name: this.name,
      status: this.status,
      version: this.version,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  private static validSku(sku: string): string {
    if (!ProductModel.SKU_PATTERN.test(sku)) {
      throw new ProductSkuInvalidException(ProductModel.SKU_PATTERN, sku);
    }

    return sku;
  }

  private static validName(name: string): string {
    const trimmedName = name.trim();

    if (trimmedName.length === 0 || trimmedName.length > ProductModel.NAME_MAX_LENGTH) {
      throw new ProductNameInvalidException(ProductModel.NAME_MAX_LENGTH);
    }

    return trimmedName;
  }

  private static validVersion(version: number): number {
    if (!Number.isInteger(version) || version < 1) {
      throw new ProductVersionInvalidException(version);
    }

    return version;
  }
}
