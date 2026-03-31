const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Zone',
  tableName: 'zones',
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
    nameEn: {
      name: 'name_en',
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    code: {
      type: 'varchar',
      length: 50,
      unique: true,
      nullable: true,
    },
    level: {
      type: 'enum',
      enum: ['province', 'district', 'ward', 'custom'],
    },
    boundary: {
      type: 'geometry',
      spatialFeatureType: 'MultiPolygon',
      srid: 4326,
    },
    centroid: {
      type: 'geometry',
      spatialFeatureType: 'Point',
      srid: 4326,
      nullable: true,
    },
    areaKm2: {
      name: 'area_km2',
      type: 'numeric',
      precision: 12,
      scale: 4,
      nullable: true,
    },
    parentId: {
      name: 'parent_id',
      type: 'uuid',
      nullable: true,
    },
    source: {
      type: 'enum',
      enum: ['osm', 'gadm', 'manual'],
      default: 'gadm',
    },
    sourceVersion: {
      name: 'source_version',
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    isActive: {
      name: 'is_active',
      type: 'boolean',
      default: true,
    },
    customNote: {
      name: 'custom_note',
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
    parent: {
      type: 'many-to-one',
      target: 'Zone',
      joinColumn: { name: 'parent_id' },
      nullable: true,
    },
    children: {
      type: 'one-to-many',
      target: 'Zone',
      inverseSide: 'parent',
    },
  },
  indices: [
    { columns: ['parentId'] },
    { columns: ['level'] },
    { columns: ['code'] },
    { spatial: true, columns: ['boundary'] },
    { spatial: true, columns: ['centroid'] },
  ],
});
