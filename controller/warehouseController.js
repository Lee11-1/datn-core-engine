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

  async bulkCreateWarehouses(ctx) {
    try {
      const warehousesData = ctx.request.body;
      const result = await warehouseService.bulkCreateWarehouses(warehousesData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: `${result.count} warehouses created successfully`,
        data: result.warehouses,
        count: result.count,
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

  async getWarehouseById(ctx) {
    try {
      const { id } = ctx.params;
      const warehouse = await warehouseService.getWarehouseById(id);

      ctx.body = {
        success: true,
        data: warehouse,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getWarehouseByCode(ctx) {
    try {
      const { code } = ctx.params;
      const warehouse = await warehouseService.getWarehouseByCode(code);

      ctx.body = {
        success: true,
        data: warehouse,
      };
    } catch (error) {
      ctx.status = 404;
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

  async getWarehousesByZone(ctx) {
    try {
      const { zoneId } = ctx.params;
      const result = await warehouseService.getWarehousesByZone(zoneId, ctx.query);

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

  async getWarehousesByManager(ctx) {
    try {
      const { managerId } = ctx.params;
      const result = await warehouseService.getWarehousesByManager(managerId, ctx.query);

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

  async assignManager(ctx) {
    try {
      const { id } = ctx.params;
      const { managerId } = ctx.request.body;

      if (!managerId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Manager ID is required',
        };
        return;
      }

      const updatedWarehouse = await warehouseService.assignManager(id, managerId);

      ctx.body = {
        success: true,
        message: 'Manager assigned to warehouse successfully',
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

  async removeManager(ctx) {
    try {
      const { id } = ctx.params;
      const updatedWarehouse = await warehouseService.removeManager(id);

      ctx.body = {
        success: true,
        message: 'Manager removed from warehouse successfully',
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

  async assignZone(ctx) {
    try {
      const { id } = ctx.params;
      const { zoneId } = ctx.request.body;

      if (!zoneId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Zone ID is required',
        };
        return;
      }

      const updatedWarehouse = await warehouseService.assignZone(id, zoneId);

      ctx.body = {
        success: true,
        message: 'Zone assigned to warehouse successfully',
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

  async removeZone(ctx) {
    try {
      const { id } = ctx.params;
      const updatedWarehouse = await warehouseService.removeZone(id);

      ctx.body = {
        success: true,
        message: 'Zone removed from warehouse successfully',
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

  async toggleWarehouseStatus(ctx) {
    try {
      const { id } = ctx.params;
      const { isActive } = ctx.request.body;

      if (isActive === undefined) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'isActive is required',
        };
        return;
      }

      const updatedWarehouse = await warehouseService.toggleWarehouseStatus(id, isActive);

      ctx.body = {
        success: true,
        message: 'Warehouse status updated successfully',
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

  async getWarehouseStatistics(ctx) {
    try {
      const statistics = await warehouseService.getWarehouseStatistics();

      ctx.body = {
        success: true,
        data: statistics,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async searchWarehouses(ctx) {
    try {
      const { q } = ctx.query;

      if (!q) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Search query is required',
        };
        return;
      }

      const result = await warehouseService.searchWarehouses(q, ctx.query);

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
}

module.exports = new WarehouseController();
