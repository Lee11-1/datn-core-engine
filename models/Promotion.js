const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'Promotion',
  tableName: 'promotions',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      generated: 'uuid',
    },
    name: {
      type: 'varchar',
      length: 200,
      nullable: false,
    },
    description: {
      type: 'text',
      nullable: true,
    },
    promotionType: {
      name: 'promotion_type',
      type: 'varchar',
      length: 30,
      nullable: false,
      comment: 'fixed_amount, percentage, free_shipping',
    },
    promotionValue: {
      name: 'promotion_value',
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: false,
    },
    maxDiscountAmount: {
      name: 'max_discount_amount',
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: true,
    },
    minOrderAmount: {
      name: 'min_order_amount',
      type: 'numeric',
      precision: 12,
      scale: 2,
      nullable: true,
    },
    productIds: {
      name: 'product_ids',
      type: 'jsonb',
      nullable: true,
      comment: 'Array of product IDs this promotion applies to',
    },
    zoneIds: {
      name: 'zone_ids',
      type: 'jsonb',
      nullable: true,
      comment: 'Array of zone IDs this promotion applies to',
    },
    usageLimit: {
      name: 'usage_limit',
      type: 'integer',
      nullable: true,
      comment: 'Maximum number of times promotion can be used',
    },
    usedCount: {
      name: 'used_count',
      type: 'integer',
      default: 0,
      comment: 'Number of times promotion has been used',
    },
    startAt: {
      name: 'start_at',
      type: 'timestamptz',
      nullable: false,
    },
    endAt: {
      name: 'end_at',
      type: 'timestamptz',
      nullable: false,
    },
    status: {
      type: 'enum',
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
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
  indices: [
    {
      name: 'idx_promotion_status',
      columns: ['status'],
    },
    {
      name: 'idx_promotion_dates',
      columns: ['startAt', 'endAt'],
    },
  ],
});
