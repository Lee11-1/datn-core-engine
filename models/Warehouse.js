const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Warehouse',
  tableName: 'warehouses',
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
    code: {
      type: 'varchar',
      length: 50,
      unique: true,
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
    managerId: {
      name: 'manager_id',
      type: 'uuid',
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
    zone: {
      type: 'many-to-one',
      target: 'Zone',
      joinColumn: { name: 'zone_id' },
      nullable: true,
    },
    manager: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'manager_id' },
      nullable: true,
    },
  },
  indices: [
    { spatial: true, columns: ['location'] },
    { columns: ['zoneId'] },
  ],
});
