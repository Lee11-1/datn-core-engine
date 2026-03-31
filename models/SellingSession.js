const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'SellingSession',
  tableName: 'selling_sessions',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    scheduleId: {
      name: 'schedule_id',
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
    checkinAt: {
      name: 'checkin_at',
      type: 'timestamptz',
    },
    checkinPhotoUrl: {
      name: 'checkin_photo_url',
      type: 'text',
    },
    checkinLocation: {
      name: 'checkin_location',
      type: 'geometry',
      spatialFeatureType: 'Point',
      srid: 4326,
    },
    checkinIp: {
      name: 'checkin_ip',
      type: 'inet',
      nullable: true,
    },
    checkinInZone: {
      name: 'checkin_in_zone',
      type: 'boolean',
      nullable: true,
    },
    checkoutAt: {
      name: 'checkout_at',
      type: 'timestamptz',
      nullable: true,
    },
    checkoutPhotoUrl: {
      name: 'checkout_photo_url',
      type: 'text',
      nullable: true,
    },
    checkoutLocation: {
      name: 'checkout_location',
      type: 'geometry',
      spatialFeatureType: 'Point',
      srid: 4326,
      nullable: true,
    },
    status: {
      type: 'enum',
      enum: ['active', 'checked_out', 'cancelled'],
      default: 'active',
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
    schedule: {
      type: 'many-to-one',
      target: 'Schedule',
      joinColumn: { name: 'schedule_id' },
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
  },
  indices: [
    { columns: ['scheduleId'] },
    { columns: ['userId'] },
    { columns: ['customerId'] },
    { spatial: true, columns: ['checkinLocation'] },
    { columns: ['checkinAt'] },
    { columns: ['status'] },
  ],
});
