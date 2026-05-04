const orderService = require('../service/orderService');

class OrderController {
  async createOrder(ctx) {
    try {
      const orderData = ctx.request.body;
      const order = await orderService.createOrder(orderData);

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'Order created successfully',
        data: order,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getOrders(ctx) {
    try {
      const result = await orderService.getOrders(ctx.query);

      ctx.body = {
        success: true,
        data: result.orders,
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

  async getOrdersBySchedule(ctx) {
    try {
      const { scheduleId } = ctx.params;
      const result = await orderService.getOrdersBySchedule(scheduleId, ctx.query);

      ctx.body = {
        success: true,
        data: result.orders,
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

  async getOrdersBySession(ctx) {
    try {
      const { sessionId } = ctx.params;
      const orders = await orderService.getOrdersBySession(sessionId);

      ctx.body = {
        success: true,
        data: orders,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getOrdersByCustomer(ctx) {
    try {
      const { customerId, scheduleId } = ctx.params;
      const orders = await orderService.getOrdersByCustomer(customerId, scheduleId);

      ctx.body = {
        success: true,
        data: orders,
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getOrderDetail(ctx) {
    try {
      const { orderId } = ctx.params;
      const order = await orderService.getOrderDetail(orderId);

      ctx.body = {
        success: true,
        data: order,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateOrderStatus(ctx) {
    try {
      const { orderId } = ctx.params;
      const data = ctx.request.body;
      const order = await orderService.updateOrderStatus(orderId, data);

      ctx.body = {
        success: true,
        message: 'Order status updated successfully',
        data: order,
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

module.exports = new OrderController();
