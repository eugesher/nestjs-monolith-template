export abstract class EntityBase<TId> {
  public get id(): TId {
    return this._id;
  }

  protected readonly _id: TId;

  protected constructor(id: TId) {
    this._id = id;
  }

  public equals(other?: EntityBase<TId>): boolean {
    if (other == null) {
      return false;
    }

    if (other.constructor !== this.constructor) {
      return false;
    }

    return this._id === other._id;
  }
}
