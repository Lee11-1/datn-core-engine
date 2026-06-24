const { getRepository } = require('../config/typeorm');

class PromotionService {
  async createPromotion(promotionData) {
    const {
      name,
      description,
      promotionType,
      promotionValue,
      maxDiscountAmount,
      minOrderAmount,
      productIds,
      zoneIds,
      usageLimit,
      startAt,
      endAt,
    } = promotionData;

    if (!name || !promotionType || !promotionValue || !startAt || !endAt) {
      throw new Error('Missing required fields: name, promotionType, promotionValue, startAt, endAt');
    }

    if (new Date(startAt) >= new Date(endAt)) {
      throw new Error('Start date must be before end date');
    }

    const promotionRepo = getRepository('Promotion');

    const newPromotion = promotionRepo.create({
      name,
      description: description || null,
      promotionType,
      promotionValue: parseFloat(promotionValue),
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      productIds: productIds && Array.isArray(productIds) ? productIds : null,
      zoneIds: zoneIds && Array.isArray(zoneIds) ? zoneIds : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usedCount: 0,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      status: 'active',
    });

    return await promotionRepo.save(newPromotion);
  }

  async getPromotions(query) {
    const { page = 1, limit = 10, search_text, status, include_expired = true } = query;
    const promotionRepo = getRepository('Promotion');

    let queryBuilder = promotionRepo.createQueryBuilder('promotion');

    if (status) {
      queryBuilder = queryBuilder.where('promotion.status = :status', { status });
    } else if (!include_expired) {
      const now = new Date();
      queryBuilder = queryBuilder.where('promotion.end_at > :now', { now });
    }

    if (search_text) {
      queryBuilder = queryBuilder.andWhere(
        '(promotion.name ILIKE :search_text OR promotion.description ILIKE :search_text)',
        { search_text: `%${search_text}%` }
      );
    }

    queryBuilder = queryBuilder.andWhere('promotion.deleted = false');

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [promotions, total] = await queryBuilder
      .orderBy('promotion.createdAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      promotions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPromotionById(id) {
    const promotionRepo = getRepository('Promotion');
    const promotion = await promotionRepo.findOne({
      where: { id },
    });

    if (!promotion) {
      throw new Error('Promotion not found');
    }

    return promotion;
  }

  async updatePromotion(id, promotionData) {
    const {
      name,
      description,
      promotionType,
      promotionValue,
      maxDiscountAmount,
      minOrderAmount,
      productIds,
      zoneIds,
      usageLimit,
      startAt,
      endAt,
      status,
    } = promotionData;

    const promotionRepo = getRepository('Promotion');
    const promotion = await this.getPromotionById(id);

    if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
      throw new Error('Start date must be before end date');
    }

    Object.assign(promotion, {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(promotionType && { promotionType }),
      ...(promotionValue && { promotionValue: parseFloat(promotionValue) }),
      ...(maxDiscountAmount !== undefined && {
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      }),
      ...(minOrderAmount !== undefined && {
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
      }),
      ...(productIds !== undefined && {
        productIds: productIds && Array.isArray(productIds) ? productIds : null,
      }),
      ...(zoneIds !== undefined && {
        zoneIds: zoneIds && Array.isArray(zoneIds) ? zoneIds : null,
      }),
      ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
      ...(startAt && { startAt: new Date(startAt) }),
      ...(endAt && { endAt: new Date(endAt) }),
      ...(status && { status }),
    });

    return await promotionRepo.save(promotion);
  }

  async deletePromotion(id) {
    const promotionRepo = getRepository('Promotion');
    const promotion = await this.getPromotionById(id);
    promotion.deleted = true;
    return await promotionRepo.save(promotion);
  }

  async updatePromotionStatus(id, status) {
    if (!['active', 'inactive', 'expired'].includes(status)) {
      throw new Error('Invalid status');
    }

    const promotionRepo = getRepository('Promotion');
    const promotion = await this.getPromotionById(id);

    promotion.status = status;
    return await promotionRepo.save(promotion);
  }

  async incrementUsageCount(id) {
    const promotionRepo = getRepository('Promotion');
    const promotion = await this.getPromotionById(id);

    // Check if usage limit reached
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      throw new Error('Promotion usage limit reached');
    }

    promotion.usedCount += 1;
    return await promotionRepo.save(promotion);
  }

  async getActivePromotions() {
    const promotionRepo = getRepository('Promotion');
    const now = new Date();

    const promotions = await promotionRepo.find({
      where: {
        status: 'active',
        startAt: { $lte: now },
        endAt: { $gte: now },
      },
    });

    return promotions;
  }

  async getPromotionsByZone(zoneId, query = {}) {
    const { page = 1, limit = 100 } = query;
    const promotionRepo = getRepository('Promotion');
    const now = new Date();

    let queryBuilder = promotionRepo.createQueryBuilder('promotion')
      .where('promotion.status = :status', { status: 'active' })
      .andWhere('promotion.start_at <= :now', { now })
      .andWhere('promotion.end_at >= :now', { now })
      .andWhere('promotion.used_count < promotion.usage_limit OR promotion.usage_limit IS NULL')
      .andWhere('promotion.deleted = false');

    if (zoneId) {
    queryBuilder = queryBuilder.andWhere(
        `
        (
            promotion.zone_ids IS NULL
            OR promotion.zone_ids @> :zoneId
            OR promotion.zone_ids @> '["all"]'
        )
        `,
        {
        zoneId: JSON.stringify([zoneId])
        }
    );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [promotions, total] = await queryBuilder
      .orderBy('promotion.created_at', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      promotions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async calculateDiscount(promotion, orderAmount) {
    if (!promotion || promotion.status !== 'active') {
      return 0;
    }

    // Check date range
    const now = new Date();
    if (now < new Date(promotion.startAt) || now > new Date(promotion.endAt)) {
      return 0;
    }

    // Check minimum order amount
    if (promotion.minOrderAmount && orderAmount < parseFloat(promotion.minOrderAmount)) {
      return 0;
    }

    // Check usage limit
    if (promotion.usageLimit && promotion.usedCount >= promotion.usageLimit) {
      return 0;
    }

    let discount = 0;

    if (promotion.promotionType === 'fixed_amount') {
      discount = parseFloat(promotion.promotionValue);
    } else if (promotion.promotionType === 'percentage') {
      discount = (orderAmount * parseFloat(promotion.promotionValue)) / 100;
      // Apply max discount if specified
      if (promotion.maxDiscountAmount) {
        discount = Math.min(discount, parseFloat(promotion.maxDiscountAmount));
      }
    } else if (promotion.promotionType === 'free_shipping') {
      discount = parseFloat(promotion.promotionValue);
    }

    return Math.min(discount, orderAmount);
  }
}

module.exports = new PromotionService();
