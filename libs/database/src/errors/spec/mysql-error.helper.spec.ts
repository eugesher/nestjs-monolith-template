import { QueryFailedError } from 'typeorm';

import { MysqlErrorHelper } from '../mysql-error.helper';

describe('MysqlErrorHelper', () => {
  describe('isDuplicateKey', () => {
    it('recognizes a duplicate entry by its errno', () => {
      const driverError = Object.assign(new Error('Duplicate entry'), { errno: 1062 });
      const error = new QueryFailedError('INSERT', [], driverError);

      expect(MysqlErrorHelper.isDuplicateKey(error)).toBe(true);
    });

    it('recognizes a duplicate entry by its code', () => {
      const driverError = Object.assign(new Error('Duplicate entry'), { code: 'ER_DUP_ENTRY' });
      const error = new QueryFailedError('INSERT', [], driverError);

      expect(MysqlErrorHelper.isDuplicateKey(error)).toBe(true);
    });

    it('rejects another query failure', () => {
      const driverError = Object.assign(new Error('Deadlock'), {
        errno: 1213,
        code: 'ER_LOCK_DEADLOCK',
      });
      const error = new QueryFailedError('UPDATE', [], driverError);

      expect(MysqlErrorHelper.isDuplicateKey(error)).toBe(false);
    });

    it('rejects an error that is not a query failure', () => {
      const error = Object.assign(new Error('Duplicate entry'), { errno: 1062 });

      expect(MysqlErrorHelper.isDuplicateKey(error)).toBe(false);
    });
  });
});
