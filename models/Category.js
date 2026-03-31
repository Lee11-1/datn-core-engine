const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Category',
  tableName: 'categories',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 255,
    },
    slug: {
      type: 'varchar',
      length: 255,
      unique: true,
    },
    parentId: {
      name: 'parent_id',
      type: 'uuid',
      nullable: true,
    },
    sortOrder: {
      name: 'sort_order',
      type: 'int',
      default: 0,
    },
    isActive: {
      name: 'is_active',
      type: 'boolean',
      default: true,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    parent: {
      type: 'many-to-one',
      target: 'Category',
      joinColumn: { name: 'parent_id' },
      nullable: true,
    },
    children: {
      type: 'one-to-many',
      target: 'Category',
      inverseSide: 'parent',
    },
  },
  indices: [
    { columns: ['parentId'] },
    { columns: ['slug'] },
  ],
});
