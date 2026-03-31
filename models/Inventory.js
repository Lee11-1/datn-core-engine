const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Inventory',
  tableName: 'inventory',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    productId: {
      name: 'product_id',
      type: 'uuid',
    },
    warehouseId: {
      name: 'warehouse_id',
      type: 'uuid',
    },
    quantity: {
      type: 'int',
      default: 0,
    },
    reservedQty: {
      name: 'reserved_qty',
      type: 'int',
      default: 0,
    },
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
  relations: {
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'product_id' },
    },
    warehouse: {
      type: 'many-to-one',
      target: 'Warehouse',
      joinColumn: { name: 'warehouse_id' },
    },
  },
  uniques: [
    {
      columns: ['product', 'warehouse'],
    },
  ],
  indices: [
    { columns: ['productId'] },
    { columns: ['warehouseId'] },
  ],
});
