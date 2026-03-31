const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Commission',
  tableName: 'commissions',
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
    orderId: {
      name: 'order_id',
      type: 'uuid',
      unique: true,
    },
    orderAmount: {
      name: 'order_amount',
      type: 'numeric',
      precision: 15,
      scale: 2,
    },
    profitAmount: {
      name: 'profit_amount',
      type: 'numeric',
      precision: 15,
      scale: 2,
      nullable: true,
    },
    commissionRate: {
      name: 'commission_rate',
      type: 'numeric',
      precision: 5,
      scale: 4,
    },
    commissionAmount: {
      name: 'commission_amount',
      type: 'numeric',
      precision: 15,
      scale: 2,
    },
    status: {
      type: 'enum',
      enum: ['pending', 'confirmed', 'paid'],
      default: 'pending',
    },
    periodMonth: {
      name: 'period_month',
      type: 'date',
    },
    paidAt: {
      name: 'paid_at',
      type: 'timestamptz',
      nullable: true,
    },
    note: {
      type: 'text',
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
    },
    order: {
      type: 'many-to-one',
      target: 'Order',
      joinColumn: { name: 'order_id' },
    },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['orderId'], unique: true },
    { columns: ['periodMonth'] },
    { columns: ['status'] },
  ],
});
