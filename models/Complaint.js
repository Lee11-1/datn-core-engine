const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Complaint',
  tableName: 'complaints',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    orderId: {
      name: 'order_id',
      type: 'uuid',
      nullable: false,
    },
    customerId: {
      name: 'customer_id',
      type: 'uuid',
        nullable: false,
    },
    userId: {
      name: 'user_id',
      type: 'uuid',
        nullable: false,
    },
    title: {
      type: 'varchar',
      length: 255,
        nullable: false,
    },
    description: {
      type: 'text',
        nullable: true,
    },  
    status: {
      type: 'varchar',
      length: 50,
      default: 'pending',
    },
    priority: {
      type: 'varchar',
      length: 50,
      default: 'normal',
    },
    complaintType: {
      name: 'complaint_type',
      type: 'varchar',
     length: 50,
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
    resolvedAt: {
      name: 'resolved_at',
      type: 'timestamptz',
        nullable: true,
    },
    resolutionNote: {
      name: 'resolution_note',
      type: 'text',
      nullable: true,
    },
  },
  relations: {
    order: {
      type: 'many-to-one',
      target: 'Order',
        joinColumn: { name: 'order_id' },
        nullable: false,
    },
    customer: {
        type: 'many-to-one',
        target: 'Customer',
        joinColumn: { name: 'customer_id' },
        nullable: false,
    },
    user: {
        type: 'many-to-one',
        target: 'User',
        joinColumn: { name: 'user_id' },
        nullable: false,
    },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['customerId'] },
    { columns: ['complaintType'] },
    { columns: ['status'] },
  ],
});
