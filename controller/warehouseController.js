const warehouseService = require('../service/warehouseService');

class WarehouseController {
  async createWarehouse(ctx) {
    try {
      const warehouseData = ctx.request.body;
      const savedWarehouse = await warehouseService.createWarehouse(warehouseData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Warehouse created successfully',
        data: savedWarehouse,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getWarehouses(ctx) {
    try {
      const result = await warehouseService.getWarehouses(ctx.query);

      ctx.body = {
        success: true,
        data: result.warehouses,
        pagination: result.pagination
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateWarehouse(ctx) {
    try {
      const { id } = ctx.params;
      const updates = ctx.request.body;
      const updatedWarehouse = await warehouseService.updateWarehouse(id, updates);

      ctx.body = {
        success: true,
        message: 'Warehouse updated successfully',
        data: updatedWarehouse,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteWarehouse(ctx) {
    try {
      const { id } = ctx.params;
      await warehouseService.deleteWarehouse(id);

      ctx.body = {
        success: true,
        message: 'Warehouse deleted successfully',
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new WarehouseController();
