import { ProductStatusEnum } from '@acme-libs/kernel';
import { AggregateRoot } from '@acme-libs/toolkit';

import { ProductPublishedEvent } from '../events/product-published.event';
import { ProductUpdatedEvent } from '../events/product-updated.event';
import { ProductNameInvalidException } from '../exceptions/product-name-invalid.exception';
import { ProductSkuInvalidException } from '../exceptions/product-sku-invalid.exception';
import { ProductVersionInvalidException } from '../exceptions/product-version-invalid.exception';
import { IProductCandidateInput } from '../interfaces/inputs/product-candidate.input';
import { IProductChangesInput } from '../interfaces/inputs/product-changes.input';
import { IProductRecordInput } from '../interfaces/inputs/product-record.input';
import { IProductDraftOutput } from '../interfaces/outputs/product-draft.output';
import { IProductSnapshotOutput } from '../interfaces/outputs/product-snapshot.output';

export class ProductModel extends AggregateRoot<string> {
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
}
