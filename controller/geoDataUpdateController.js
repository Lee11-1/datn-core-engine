const geoDataUpdateService = require('../service/geoDataUpdateService');

class GeoDataUpdateController {
  async createGeoDataUpdate(ctx) {
    try {
      const updateData = ctx.request.body;
      const newUpdate = await geoDataUpdateService.createGeoDataUpdate(updateData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'GeoDataUpdate created successfully',
        data: newUpdate,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getGeoDataUpdates(ctx) {
    try {
      const result = await geoDataUpdateService.getGeoDataUpdates(ctx.query);

      ctx.body = {
        success: true,
        data: result.updates,
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

  async getGeoDataUpdateById(ctx) {
    try {
      const { id } = ctx.params;
      const update = await geoDataUpdateService.getGeoDataUpdateById(id);

      ctx.body = {
        success: true,
        data: update,
      };
    } catch (error) {
      if (error.message === 'GeoDataUpdate not found') {
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

  async updateGeoDataUpdate(ctx) {
    try {
      const { id } = ctx.params;
      const updateData = ctx.request.body;
      const updatedUpdate = await geoDataUpdateService.updateGeoDataUpdate(id, updateData);

      ctx.body = {
        success: true,
        message: 'GeoDataUpdate updated successfully',
        data: updatedUpdate,
      };
    } catch (error) {
      if (error.message === 'GeoDataUpdate not found') {
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

  async deleteGeoDataUpdate(ctx) {
    try {
      const { id } = ctx.params;
      await geoDataUpdateService.deleteGeoDataUpdate(id);

      ctx.body = {
        success: true,
        message: 'GeoDataUpdate deleted successfully',
      };
    } catch (error) {
      if (error.message === 'GeoDataUpdate not found') {
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

}

module.exports = new GeoDataUpdateController();
