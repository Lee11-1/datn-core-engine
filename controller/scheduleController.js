const scheduleService = require('../service/scheduleService');

class ScheduleController {
  async createSchedule(ctx) {
    try {
      const scheduleData = ctx.request.body;
      const savedSchedule = await scheduleService.createSchedule(scheduleData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Schedule created successfully',
        data: savedSchedule,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async createMultiSchedules(ctx) {
    try {
      const bulkScheduleData = ctx.request.body;
      const result = await scheduleService.createMultiSchedules(bulkScheduleData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: `${result.count} schedules created successfully`,
        data: result.schedules,
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

  async getSchedules(ctx) {
    try {
      const result = await scheduleService.getSchedules(ctx.query);

      ctx.body = {
        success: true,
        data: result.schedules,
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

  async getScheduleById(ctx) {
    try {
      const { id } = ctx.params;
      const schedule = await scheduleService.getScheduleById(id);

      ctx.body = {
        success: true,
        data: schedule,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateSchedule(ctx) {
    try {
      const { id } = ctx.params;
      const updates = ctx.request.body;
      const updatedSchedule = await scheduleService.updateSchedule(id, updates);

      ctx.body = {
        success: true,
        message: 'Schedule updated successfully',
        data: updatedSchedule,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteSchedule(ctx) {
    try {
      const { id } = ctx.params;
      await scheduleService.deleteSchedule(id);

      ctx.body = {
        success: true,
        message: 'Schedule deleted successfully',
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getSchedulesByUser(ctx) {
    try {
      const { userId } = ctx.params;
      const result = await scheduleService.getSchedulesByUser(userId, ctx.query);

      ctx.body = {
        success: true,
        data: result.schedules,
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

  async getSchedulesByZone(ctx) {
    try {
      const { zoneId } = ctx.params;
      const result = await scheduleService.getSchedulesByZone(zoneId, ctx.query);

      ctx.body = {
        success: true,
        data: result.schedules,
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

  async getSchedulesByDate(ctx) {
    try {
      const { date } = ctx.params;
      const result = await scheduleService.getSchedulesByDate(date, ctx.query);

      ctx.body = {
        success: true,
        data: result.schedules,
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

  async changeScheduleStatus(ctx) {
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

      const updatedSchedule = await scheduleService.changeScheduleStatus(id, status);

      ctx.body = {
        success: true,
        message: 'Schedule status updated successfully',
        data: updatedSchedule,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async assignScheduleToWarehouse(ctx) {
    try {
      const { id } = ctx.params;
      const { warehouseId } = ctx.request.body;

      if (!warehouseId) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Warehouse ID is required',
        };
        return;
      }

      const updatedSchedule = await scheduleService.assignScheduleToWarehouse(id, warehouseId);

      ctx.body = {
        success: true,
        message: 'Schedule assigned to warehouse successfully',
        data: updatedSchedule,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getStatistics(ctx) {
    try {
      const statistics = await scheduleService.getStatistics(ctx.query);

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
}

module.exports = new ScheduleController();
