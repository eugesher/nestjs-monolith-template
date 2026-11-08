import { PermissionController } from '../permission.controller';

describe('PermissionController', () => {
  describe('handleList', () => {
    it('answers the codes of the use case', () => {
      const list = jest.fn().mockReturnValue({ codes: ['ledger:read'] });
      const controller = new PermissionController({ execute: list });

      const response = controller.handleList();

      expect(response).toEqual({ codes: ['ledger:read'] });
    });
  });
});
