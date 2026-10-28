import { ArgumentsHost, ConflictException } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError } from 'typeorm';

import { DuplicateKeyExceptionFilter } from '../duplicate-key-exception.filter';

describe('DuplicateKeyExceptionFilter', () => {
  let baseCatch: jest.SpyInstance;

  beforeEach(() => {
    baseCatch = jest.spyOn(BaseExceptionFilter.prototype, 'catch').mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('answers a duplicate key with 409 Resource already exists', () => {
    const driverError = Object.assign(new Error('Duplicate entry'), { errno: 1062 });
    const exception = new QueryFailedError('INSERT', [], driverError);
    const host = {} as ArgumentsHost;

    new DuplicateKeyExceptionFilter().catch(exception, host);

    const [answered] = baseCatch.mock.calls[0] as [ConflictException];

    expect(answered).toBeInstanceOf(ConflictException);
    expect(answered.getResponse()).toEqual({
      statusCode: 409,
      message: 'Resource already exists',
      error: 'Conflict',
    });
  });

  it('passes another query failure to the default handler as is', () => {
    const driverError = Object.assign(new Error('Deadlock'), { errno: 1213 });
    const exception = new QueryFailedError('UPDATE', [], driverError);
    const host = {} as ArgumentsHost;

    new DuplicateKeyExceptionFilter().catch(exception, host);

    expect(baseCatch).toHaveBeenCalledWith(exception, host);
  });
});
