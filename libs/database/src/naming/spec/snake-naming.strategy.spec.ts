import { SnakeNamingStrategy } from '../snake-naming.strategy';

describe('SnakeNamingStrategy', () => {
  describe('tableName', () => {
    it('snake-cases the class name', () => {
      const name = new SnakeNamingStrategy().tableName('NoteRevision', undefined);

      expect(name).toBe('note_revision');
    });

    it('splits an acronym from the following word', () => {
      const name = new SnakeNamingStrategy().tableName('HTTPRequestLog', undefined);

      expect(name).toBe('http_request_log');
    });

    it('keeps a custom name as is', () => {
      const name = new SnakeNamingStrategy().tableName('NoteRevision', 'revisions');

      expect(name).toBe('revisions');
    });
  });

  describe('columnName', () => {
    it('snake-cases the property name', () => {
      const name = new SnakeNamingStrategy().columnName('createdAt', undefined, []);

      expect(name).toBe('created_at');
    });

    it('keeps a digit attached to the word before it', () => {
      const name = new SnakeNamingStrategy().columnName('line2Text', undefined, []);

      expect(name).toBe('line2_text');
    });

    it('prefixes the snake-cased embedded path', () => {
      const name = new SnakeNamingStrategy().columnName('zipCode', undefined, [
        'billing',
        'postalAddress',
      ]);

      expect(name).toBe('billing_postal_address_zip_code');
    });

    it('prefixes a custom name without changing it', () => {
      const name = new SnakeNamingStrategy().columnName('zipCode', 'ZIP', ['billing']);

      expect(name).toBe('billing_ZIP');
    });
  });

  it('relationName snake-cases the property name', () => {
    const name = new SnakeNamingStrategy().relationName('ownerUser');

    expect(name).toBe('owner_user');
  });

  it('joinColumnName joins the relation and the referenced column', () => {
    const name = new SnakeNamingStrategy().joinColumnName('ownerUser', 'id');

    expect(name).toBe('owner_user_id');
  });

  it('joinTableName joins both tables through the property path', () => {
    const name = new SnakeNamingStrategy().joinTableName('role', 'permission', 'grants.items');

    expect(name).toBe('role_grants_items_permission');
  });

  describe('joinTableColumnName', () => {
    it('joins the table and the column', () => {
      const name = new SnakeNamingStrategy().joinTableColumnName('role', 'roleId', 'id');

      expect(name).toBe('role_id');
    });

    it('falls back to the property without a column', () => {
      const name = new SnakeNamingStrategy().joinTableColumnName('role', 'permissionCode');

      expect(name).toBe('role_permission_code');
    });
  });

  it('joinTableInverseColumnName follows joinTableColumnName', () => {
    const name = new SnakeNamingStrategy().joinTableInverseColumnName('permission', 'code', 'id');

    expect(name).toBe('permission_id');
  });
});
