const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Customer',
  tableName: 'customers',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    fullName: {
      name: 'full_name',
      type: 'varchar',
      length: 255,
    },
    phone: {
      type: 'varchar',
      length: 20,
      unique: true,
      nullable: true,
    },
    email: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    address: {
      type: 'text',
      nullable: true,
    },
    location: {
      type: 'geometry',
      spatialFeatureType: 'Point',
      srid: 4326,
      nullable: true,
    },
    zoneId: {
      name: 'zone_id',
      type: 'uuid',
      nullable: true,
    },
    addedBy: {
      name: 'added_by',
      type: 'uuid',
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
    zone: {
      type: 'many-to-one',
      target: 'Zone',
      joinColumn: { name: 'zone_id' },
      nullable: true,
    },
    addedByUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'added_by' },
      nullable: true,
    },
  },
  indices: [
    { spatial: true, columns: ['location'] },
    { columns: ['zoneId'] },
    { columns: ['phone'] },
  ],
});
