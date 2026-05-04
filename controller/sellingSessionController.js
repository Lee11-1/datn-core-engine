const sellingSessionService = require('../service/sellingSessionService');

class SellingSessionController {
  async createSellingSession(ctx) {
    try {
      const sessionData = ctx.request.body;
      const session = await sellingSessionService.createSellingSession(sessionData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Selling session created successfully',
        data: session,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getSellingSessionsBySchedule(ctx) {
    try {
      const { scheduleId } = ctx.params;
      const result = await sellingSessionService.getSellingSessionsBySchedule(scheduleId, ctx.query);

      ctx.body = {
        success: true,
        data: result.sessions,
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

  async getSellingSessionsByCustomer(ctx) {
    try {
      const { customerId } = ctx.params;
      const sessions = await sellingSessionService.getSellingSessionsByCustomer(customerId);

      ctx.body = {
        success: true,
        data: sessions,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getSellingSessionDetail(ctx) {
    try {
      const { sessionId } = ctx.params;
      const session = await sellingSessionService.getSellingSessionDetail(sessionId);

      ctx.body = {
        success: true,
        data: session,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async checkoutSellingSession(ctx) {
    try {
      const { sessionId } = ctx.params;
      const data = ctx.request.body || {};
      const session = await sellingSessionService.checkoutSellingSession(sessionId, data);

      ctx.body = {
        success: true,
        message: 'Selling session checked out successfully',
        data: session,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async cancelSellingSession(ctx) {
    try {
      const { sessionId } = ctx.params;
      const { note } = ctx.request.body || {};
      const session = await sellingSessionService.cancelSellingSession(sessionId, note);

      ctx.body = {
        success: true,
        message: 'Selling session cancelled successfully',
        data: session,
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

module.exports = new SellingSessionController();
