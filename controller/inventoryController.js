const inventoryService = require('../service/inventoryService');

class InventoryController {
  /**
   * Get all inventory with filters
   */
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

  /**
   * Get single inventory by ID
   */
  async getInventoryById(ctx) {
    try {
      const { id } = ctx.params;
      const inventory = await inventoryService.getInventoryById(id);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: inventory,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Check available quantity for product at warehouse
   */
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

  /**
   * Reserve inventory quantity
   */
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

  /**
   * Deduct inventory quantity
   */
  async deductQuantity(ctx) {
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

      const result = await inventoryService.deductQuantity(
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

  /**
   * Update inventory record
   */
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

  /**
   * Add inventory quantity
   */
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

  /**
   * Release reserved quantity
   */
  async releaseReservedQuantity(ctx) {
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

      const result = await inventoryService.releaseReservedQuantity(
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

  /**
   * Get inventory movement history
   */
  async getMovementHistory(ctx) {
    try {
      const { productId, warehouseId, action, limit } = ctx.query;

      const filters = {};
      if (productId) filters.productId = productId;
      if (warehouseId) filters.warehouseId = warehouseId;
      if (action) filters.action = action;
      if (limit) filters.limit = parseInt(limit);

      const history = await inventoryService.getInventoryMovementHistory(filters);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: history,
        count: history.length,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(ctx) {
    try {
      const { threshold = 10 } = ctx.query;

      const lowStock = await inventoryService.getLowStockProducts(parseInt(threshold));

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: lowStock,
        count: lowStock.length,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Get inventory summary by warehouse
   */
  async getWarehouseSummary(ctx) {
    try {
      const { warehouseId } = ctx.params;

      if (!warehouseId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'warehouseId is required',
        };
        return;
      }

      const summary = await inventoryService.getInventorySummaryByWarehouse(warehouseId);

      ctx.status = 200;
      ctx.body = {
        success: true,
        data: summary,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * Transfer inventory between warehouses
   */
  async transferInventory(ctx) {
    try {
      const { productId, fromWarehouseId, toWarehouseId, quantity } = ctx.request.body;
      const userId = ctx.state.user?.id;

      // Validation
      if (!productId || !fromWarehouseId || !toWarehouseId || !quantity) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'productId, fromWarehouseId, toWarehouseId, and quantity are required',
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

      if (fromWarehouseId === toWarehouseId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Source and destination warehouses cannot be the same',
        };
        return;
      }

      const result = await inventoryService.transferInventory(
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        userId
      );

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
}

module.exports = new InventoryController();
