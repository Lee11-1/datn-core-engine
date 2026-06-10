const inventoryService = require('../service/inventoryService');

class InventoryController {
  async getInventory(ctx) {
    try {
      const result = await inventoryService.getInventory(ctx.query);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: result.inventory,
        pagination: result.pagination,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async checkAvailableQuantity(ctx) {
    try {
      const { productId, warehouseId } = ctx.request.body;

      if (!productId || !warehouseId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'productId and warehouseId are required',
        };
        return;
      }

      const availability = await inventoryService.checkAvailableQuantity(productId, warehouseId);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: availability,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async reserveQuantity(ctx) {
    try {
      const { productId, warehouseId, quantity, orderId } = ctx.request.body;
      const userId = ctx.state.user?.id;

      // Validation
      if (!productId || !warehouseId || !quantity) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'productId, warehouseId, and quantity are required',
        };
        return;
      }

      if (quantity <= 0) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Quantity must be greater than 0',
        };
        return;
      }

      const result = await inventoryService.reserveQuantity(
        productId,
        warehouseId,
        quantity,
        userId,
        orderId
      );

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: result.message,
        data: result.inventory,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteInventory(ctx) {
    try {
      const { id, userId } = ctx.request.query;
      const result = await inventoryService.deleteInventory(id, userId);

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: result.message,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateInventory(ctx) {
    try {
      const { id } = ctx.params;
      const { quantity, reservedQty, userId } = ctx.request.body;
      if (!id) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Inventory ID is required',
        };
        return;
      }

      if (quantity === undefined && reservedQty === undefined) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'At least quantity or reservedQty must be provided',
        };
        return;
      }

      const result = await inventoryService.updateInventory(id, {
        quantity,
        reservedQty,
        userId,
      });

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Inventory updated successfully',
        data: result,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async createQuantity(ctx) {
    try {
      const { productId, warehouseId, quantity, userId } = ctx.request.body;

      const result = await inventoryService.createQuantity(
        productId,
        warehouseId,
        quantity,
        userId,
      );

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: result.message,
        data: result.inventory,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

}

module.exports = new InventoryController();
