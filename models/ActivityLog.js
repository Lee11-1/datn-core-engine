const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'ActivityLog',
  tableName: 'activity_logs',
  columns: {
    id: {
      type: 'bigint',
      primary: true,
      generated: 'increment',
    },
    userId: {
      name: 'user_id',
      type: 'uuid',
      nullable: true,
    },
    action: {
      type: 'varchar',
      length: 100,
    },
    entityType: {
      name: 'entity_type',
      type: 'varchar',
      length: 100,
      nullable: true,
    },
    entityId: {
      name: 'entity_id',
      type: 'uuid',
      nullable: true,
    },
    level: {
      type: 'enum',
      enum: ['info', 'warning', 'error', 'critical'],
      default: 'info',
    },
    ipAddress: {
      name: 'ip_address',
      type: 'inet',
      nullable: true,
    },
    userAgent: {
      name: 'user_agent',
      type: 'text',
      nullable: true,
    },
    metadata: {
      type: 'jsonb',
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
      nullable: true,
    },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['action'] },
    { columns: ['entityType', 'entityId'] },
    { columns: ['createdAt'] },
    { columns: ['level'] },
  ],
});
