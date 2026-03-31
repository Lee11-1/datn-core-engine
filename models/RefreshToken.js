const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'RefreshToken',
  tableName: 'refresh_tokens',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    userId: {
      name: 'user_id',
      type: 'uuid',
    },
    tokenHash: {
      name: 'token_hash',
      type: 'varchar',
      length: 255,
      unique: true,
    },
    deviceInfo: {
      name: 'device_info',
      type: 'text',
      nullable: true,
    },
    ipAddress: {
      name: 'ip_address',
      type: 'inet',
      nullable: true,
    },
    expiresAt: {
      name: 'expires_at',
      type: 'timestamptz',
    },
    revokedAt: {
      name: 'revoked_at',
      type: 'timestamptz',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
      onDelete: 'CASCADE',
    },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['expiresAt'] },
  ],
});
