const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'OrderItem',
  tableName: 'order_items',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    orderId: {
      name: 'order_id',
      type: 'uuid',
    },
    productId: {
      name: 'product_id',
      type: 'uuid',
    },
    warehouseId: {
      name: 'warehouse_id',
      type: 'uuid',
      nullable: true,
    },
    quantity: {
      type: 'int',
    },
    unitPrice: {
      name: 'unit_price',
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
    discount: {
      type: 'numeric',
      precision: 15,
      scale: 2,
      default: 0,
    },
    subtotal: {
      type: 'numeric',
      precision: 15,
      scale: 2,
    },
    createdAt: {
      name: 'created_at',
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: { name: 'order_id' },
      onDelete: 'CASCADE',
    },
    product: {
      type: 'many-to-one',
      target: 'Product',
      joinColumn: { name: 'product_id' },
    },
    warehouse: {
      type: 'many-to-one',
      target: 'Warehouse',
      joinColumn: { name: 'warehouse_id' },
      nullable: true,
    },
  },
  indices: [
    { columns: ['orderId'] },
    { columns: ['productId'] },
  ],
});
