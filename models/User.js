const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    username: {
      type: 'varchar',
      length: 100,
      unique: true,
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    passwordHash: {
      name: 'password_hash',
      type: 'varchar',
      length: 255,
    },
    fullName: {
      name: 'full_name',
      type: 'varchar',
      length: 255,
    },
    phone: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    avatarUrl: {
      name: 'avatar_url',
      type: 'text',
      nullable: true,
    },
    role: {
      type: 'enum',
      enum: ['admin', 'manager', 'sale'],
      default: 'sale',
    },
    status: {
      type: 'enum',
      enum: ['active', 'inactive', 'suspended'],
      default: 'active',
    },
    managerId: {
      name: 'manager_id',
      type: 'uuid',
      nullable: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
    lastLoginAt: {
      name: 'last_login_at',
      type: 'timestamptz',
      nullable: true,
    },
  },
  relations: {
    manager: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'manager_id' },
      nullable: true,
    },
    subordinates: {
      type: 'one-to-many',
      target: 'User',
      inverseSide: 'manager',
    },
    refreshTokens: {
      type: 'one-to-many',
      target: 'RefreshToken',
      inverseSide: 'user',
    },
  },
  indices: [
    { columns: ['role'] },
    { columns: ['managerId'] },
    { columns: ['status'] },
  ],
});
