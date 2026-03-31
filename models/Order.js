const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Order',
  tableName: 'orders',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    orderCode: {
      name: 'order_code',
      type: 'varchar',
      length: 50,
      unique: true,
    },
    sessionId: {
      name: 'session_id',
      type: 'uuid',
    },
    userId: {
      name: 'user_id',
      type: 'uuid',
    },
    customerId: {
      name: 'customer_id',
      type: 'uuid',
    },
    warehouseId: {
      name: 'warehouse_id',
      type: 'uuid',
      nullable: true,
    },
    orderPhotoUrl: {
      name: 'order_photo_url',
      type: 'text',
    },
    orderLocation: {
      name: 'order_location',
      type: 'geometry',
      spatialFeatureType: 'Point',
      srid: 4326,
      nullable: true,
    },
    totalAmount: {
      name: 'total_amount',
      type: 'numeric',
      precision: 15,
      scale: 2,
      default: 0,
    },
    discountAmount: {
      name: 'discount_amount',
      type: 'numeric',
      precision: 15,
      scale: 2,
      default: 0,
    },
    finalAmount: {
      name: 'final_amount',
      type: 'numeric',
      precision: 15,
      scale: 2,
      default: 0,
    },
    status: {
      type: 'enum',
      enum: ['pending', 'approved', 'rejected', 'cancelled'],
      default: 'pending',
    },
    rejectReason: {
      name: 'reject_reason',
      type: 'enum',
      enum: ['out_of_zone', 'out_of_session', 'bad_photo', 'manual'],
      nullable: true,
    },
    rejectNote: {
      name: 'reject_note',
      type: 'text',
      nullable: true,
    },
    autoRejected: {
      name: 'auto_rejected',
      type: 'boolean',
      default: false,
    },
    approvedBy: {
      name: 'approved_by',
      type: 'uuid',
      nullable: true,
    },
    approvedAt: {
      name: 'approved_at',
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
    updatedAt: {
      name: 'updated_at',
      type: 'timestamptz',
      updateDate: true,
    },
  },
  relations: {
    session: {
      type: 'many-to-one',
      target: 'SellingSession',
      joinColumn: { name: 'session_id' },
    },
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
    customer: {
      type: 'many-to-one',
      target: 'Customer',
      joinColumn: { name: 'customer_id' },
    },
    warehouse: {
      type: 'many-to-one',
      target: 'Warehouse',
      joinColumn: { name: 'warehouse_id' },
      nullable: true,
    },
    approver: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'approved_by' },
      nullable: true,
    },
    items: {
      type: 'one-to-many',
      target: 'OrderItem',
      inverseSide: 'order',
    },
  },
  indices: [
    { columns: ['sessionId'] },
    { columns: ['userId'] },
    { columns: ['customerId'] },
    { columns: ['status'] },
    { columns: ['createdAt'] },
    { spatial: true, columns: ['orderLocation'] },
    { columns: ['orderCode'] },
  ],
});
