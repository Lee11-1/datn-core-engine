const promotionService = require('../service/promotionService');

class PromotionController {
  async createPromotion(ctx) {
    try {
      const promotionData = ctx.request.body;
      const newPromotion = await promotionService.createPromotion(promotionData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Promotion created successfully',
        data: newPromotion,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getPromotions(ctx) {
    try {
      const result = await promotionService.getPromotions(ctx.query);

      ctx.body = {
        success: true,
        data: result.promotions,
        pagination: result.pagination,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getPromotionById(ctx) {
    try {
      const { id } = ctx.params;
      const promotion = await promotionService.getPromotionById(id);

      ctx.body = {
        success: true,
        data: promotion,
      };
    } catch (error) {
      if (error.message === 'Promotion not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updatePromotion(ctx) {
    try {
      const { id } = ctx.params;
      const promotionData = ctx.request.body;
      const updatedPromotion = await promotionService.updatePromotion(id, promotionData);

      ctx.body = {
        success: true,
        message: 'Promotion updated successfully',
        data: updatedPromotion,
      };
    } catch (error) {
      if (error.message === 'Promotion not found') {
        ctx.status = 404;
      } else {
        ctx.status = 400;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deletePromotion(ctx) {
    try {
      const { id } = ctx.params;
      await promotionService.deletePromotion(id);

      ctx.body = {
        success: true,
        message: 'Promotion deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Promotion not found') {
        ctx.status = 404;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { status } = ctx.request.body;

      if (!status) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Status is required',
        };
        return;
      }

      const updatedPromotion = await promotionService.updatePromotionStatus(id, status);

      ctx.body = {
        success: true,
        message: 'Promotion status updated successfully',
        data: updatedPromotion,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getActivePromotions(ctx) {
    try {
      const promotions = await promotionService.getActivePromotions();

      ctx.body = {
        success: true,
        data: promotions,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getPromotionsByZone(ctx) {
    try {
      const { zoneId } = ctx.params;
      const result = await promotionService.getPromotionsByZone(zoneId, ctx.query);

      ctx.body = {
        success: true,
        data: result.promotions,
        pagination: result.pagination,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new PromotionController();
