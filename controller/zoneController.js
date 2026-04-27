const zoneService = require('../service/zoneService');

class ZoneController {
  async createZone(ctx) {
    try {
      const zoneData = ctx.request.body;
      const newZone = await zoneService.createZone(zoneData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Zone created successfully',
        data: newZone,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getZones(ctx) {
    try {
      const result = await zoneService.getZones(ctx.query);

      ctx.body = {
        success: true,
        data: result.zones,
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

  async getZoneById(ctx) {
    try {
      const { id } = ctx.params;
      const zone = await zoneService.getZoneById(id);

      ctx.body = {
        success: true,
        data: zone,
      };
    } catch (error) {
      if (error.message === 'Zone not found') {
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

  async getZoneByCode(ctx) {
    try {
      const { code } = ctx.params;
      const zone = await zoneService.getZoneByCode(code);

      ctx.body = {
        success: true,
        data: zone,
      };
    } catch (error) {
      if (error.message === 'Zone not found') {
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

  async updateZone(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedZone = await zoneService.updateZone(id, updateData);

      ctx.body = {
        success: true,
        message: 'Zone updated successfully',
        data: updatedZone,
      };
    } catch (error) {
      if (error.message === 'Zone not found') {
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

  async deleteZone(ctx) {
    try {
      const { id } = ctx.params;
      await zoneService.deleteZone(id);

      ctx.body = {
        success: true,
        message: 'Zone deleted successfully',
      };
    } catch (error) {
      if (error.message === 'Zone not found') {
        ctx.status = 404;
      } else if (error.message.includes('Cannot delete')) {
        ctx.status = 400;
      } else {
        ctx.status = 500;
      }
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getZoneTree(ctx) {
    try {
      const tree = await zoneService.getZoneTree(ctx.query);

      ctx.body = {
        success: true,
        data: tree,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getZonesByLevel(ctx) {
    try {
      const { level } = ctx.params;
      const result = await zoneService.getZonesByLevel(level, ctx.query);

      ctx.body = {
        success: true,
        data: result.zones,
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

  async getChildZones(ctx) {
    try {
      const { parentId } = ctx.params;
      const result = await zoneService.getChildZones(parentId, ctx.query);

      ctx.body = {
        success: true,
        data: result.zones,
        pagination: result.pagination,
      };
    } catch (error) {
      if (error.message === 'Parent zone not found') {
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

  async activateZone(ctx) {
    try {
      const { id } = ctx.params;
      const zone = await zoneService.activateZone(id);

      ctx.body = {
        success: true,
        message: 'Zone activated successfully',
        data: zone,
      };
    } catch (error) {
      if (error.message === 'Zone not found') {
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

  async deactivateZone(ctx) {
    try {
      const { id } = ctx.params;
      const zone = await zoneService.deactivateZone(id);

      ctx.body = {
        success: true,
        message: 'Zone deactivated successfully',
        data: zone,
      };
    } catch (error) {
      if (error.message === 'Zone not found') {
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

  async syncZones(ctx) {
    try {
      const syncData = ctx.request.body;
      const result = await zoneService.syncZones(syncData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Zones synced successfully',
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
}

module.exports = new ZoneController();
