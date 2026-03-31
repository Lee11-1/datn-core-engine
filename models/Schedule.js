const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Schedule',
  tableName: 'schedules',
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
    zoneId: {
      name: 'zone_id',
      type: 'uuid',
    },
    warehouseId: {
      name: 'warehouse_id',
      type: 'uuid',
      nullable: true,
    },
    scheduledDate: {
      name: 'scheduled_date',
      type: 'date',
    },
    startTime: {
      name: 'start_time',
      type: 'time',
    },
    endTime: {
      name: 'end_time',
      type: 'time',
    },
    status: {
      type: 'enum',
      enum: ['planned', 'ongoing', 'completed', 'cancelled'],
      default: 'planned',
    },
    note: {
      type: 'text',
      nullable: true,
    },
    createdBy: {
      name: 'created_by',
      type: 'uuid',
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
    user: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'user_id' },
    },
    zone: {
      type: 'many-to-one',
      target: 'Zone',
      joinColumn: { name: 'zone_id' },
    },
    warehouse: {
      type: 'many-to-one',
      target: 'Warehouse',
      joinColumn: { name: 'warehouse_id' },
      nullable: true,
    },
    creator: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'created_by' },
    },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['zoneId'] },
    { columns: ['scheduledDate'] },
    { columns: ['status'] },
  ],
});
