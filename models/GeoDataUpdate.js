const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'GeoDataUpdate',
  tableName: 'geo_data_updates',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    source: {
      type: 'enum',
      enum: ['osm', 'gadm', 'manual'],
    },
    version: {
      type: 'varchar',
      length: 100,
    },
    zonesAdded: {
      name: 'zones_added',
      type: 'int',
      default: 0,
    },
    zonesUpdated: {
      name: 'zones_updated',
      type: 'int',
      default: 0,
    },
    zonesRemoved: {
      name: 'zones_removed',
      type: 'int',
      default: 0,
    },
    status: {
      type: 'varchar',
      length: 20,
      default: 'success',
    },
    errorDetail: {
      name: 'error_detail',
      type: 'text',
      nullable: true,
    },
    triggeredBy: {
      name: 'triggered_by',
      type: 'uuid',
      nullable: true,
    },
    appliedAt: {
      name: 'applied_at',
      type: 'timestamptz',
      createDate: true,
    },
  },
  relations: {
    triggeredByUser: {
      type: 'many-to-one',
      target: 'User',
      joinColumn: { name: 'triggered_by' },
      nullable: true,
    },
  },
});
