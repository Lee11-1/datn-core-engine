const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Product',
  tableName: 'products',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    sku: {
      type: 'varchar',
      length: 100,
      unique: true,
    },
    name: {
      type: 'varchar',
      length: 255,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    categoryId: {
      name: 'category_id',
      type: 'uuid',
      nullable: true,
    },
    price: {
      type: 'numeric',
      precision: 15,
      scale: 2,
    },
    costPrice: {
      name: 'cost_price',
      type: 'numeric',
      precision: 15,
      scale: 2,
      nullable: true,
    },
    unit: {
      type: 'varchar',
      length: 50,
      default: 'cái',
    },
    weightG: {
      name: 'weight_g',
      type: 'numeric',
      precision: 10,
      scale: 2,
      nullable: true,
    },
    images: {
      type: 'json',
      nullable: true,
    },
    mongoDetailId: {
      name: 'mongo_detail_id',
      type: 'varchar',
      length: 100,
      nullable: true,
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
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
  relations: {
    category: {
      type: 'many-to-one',
      target: 'Category',
      joinColumn: { name: 'category_id' },
      nullable: true,
    },
  },
  indices: [
    { columns: ['sku'] },
    { columns: ['categoryId'] },
  ],
});
