const { getRepository } = require('../config/typeorm');

class OrderService {
  async createOrder(orderData) {
    const { sessionId, userId, customerId, orderPhotoUrl, orderLocation, items, totalAmount, discountAmount, finalAmount } = orderData;

    if (!sessionId || !userId || !customerId || !orderPhotoUrl || !items || !items.length) {
      throw new Error('Missing required fields: sessionId, userId, customerId, orderPhotoUrl, items');
    }

    const orderRepo = getRepository('Order');
    const sessionRepo = getRepository('SellingSession');
    const userRepo = getRepository('User');
    const customerRepo = getRepository('Customer');
    const productRepo = getRepository('Product');

    const session = await sessionRepo.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error('Selling session not found');
    }

    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const customer = await customerRepo.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    for (const item of items) {
      const product = await productRepo.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }
    }

    const orderCode = await this.generateOrderCode();

    let location = null;
    if (orderLocation && orderLocation.coordinates) {
      location = {
        type: 'Point',
        coordinates: orderLocation.coordinates,
      };
    }

    const order = orderRepo.create({
      orderCode,
      sessionId,
      userId,
      customerId,
      orderPhotoUrl,
      orderLocation: location,
      totalAmount: totalAmount || 0,
      discountAmount: discountAmount || 0,
      finalAmount: finalAmount || 0,
      status: 'pending',
    });

    const savedOrder = await orderRepo.save(order);

    // Create order items
    const orderItemRepo = getRepository('OrderItem');
    for (const item of items) {
      const orderItem = orderItemRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice || null,
        discount: item.discount || 0,
        subtotal: item.subtotal || (item.unitPrice * item.quantity),
      });
      await orderItemRepo.save(orderItem);
    }

    // Reload order with items
    const orderWithItems = await orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['session', 'user', 'customer', 'items'],
    });

    return orderWithItems;
  }

  async getOrders(query) {
    const { page = 1, limit = 10, userId, customerId, sessionId, status } = query;
    const orderRepo = getRepository('Order');

    const where = {};
    if (userId) where.userId = userId;
    if (customerId) where.customerId = customerId;
    if (sessionId) where.sessionId = sessionId;
    if (status) where.status = status;

    const [orders, total] = await orderRepo.findAndCount({
      where,
      relations: ['session', 'user', 'customer', 'items'],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
    });

    return {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getOrdersBySchedule(scheduleId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const orderRepo = getRepository('Order');

    const [orders, total] = await orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.session', 'session')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .where('session.scheduleId = :scheduleId', { scheduleId })
      .take(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .orderBy('order.createdAt', 'DESC')
      .getManyAndCount();

    return {
      orders,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getOrdersBySession(sessionId) {
    const orderRepo = getRepository('Order');

    const orders = await orderRepo.find({
      where: { sessionId },
      relations: ['session', 'user', 'customer', 'items'],
      order: { createdAt: 'DESC' },
    });

    return orders;
  }

  async getOrdersByCustomer(customerId, scheduleId = null) {
    const orderRepo = getRepository('Order');

    let query = orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.session', 'session')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.customerId = :customerId', { customerId });

    if (scheduleId) {
      query = query.andWhere('session.scheduleId = :scheduleId', { scheduleId });
    }

    const orders = await query.orderBy('order.createdAt', 'DESC').getMany();

    return orders;
  }

  async getOrderDetail(orderId) {
    const orderRepo = getRepository('Order');

    const order = await orderRepo.findOne({
      where: { id: orderId },
      relations: ['session', 'user', 'customer', 'items', 'warehouse', 'approver'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId, data) {
    const { status, rejectReason, rejectNote, approvedBy, note } = data;

    const orderRepo = getRepository('Order');
    const order = await orderRepo.findOne({ where: { id: orderId } });

    if (!order) {
      throw new Error('Order not found');
    }

    if (status) {
      order.status = status;
    }

    if (status === 'approved') {
      order.approvedAt = new Date();
      order.approvedBy = approvedBy || null;
    }

    if (status === 'rejected') {
      order.rejectReason = rejectReason || null;
      order.rejectNote = rejectNote || null;
      order.autoRejected = true;
    }

    if (note) {
      order.note = note;
    }

    const updatedOrder = await orderRepo.save(order);

    return updatedOrder;
  }

  async generateOrderCode() {
    const orderRepo = getRepository('Order');
    const now = new Date();
    const date = now.getTime();
    const random = Math.floor(Math.random() * 10000);
    const code = `ORD-${date}-${random}`;

    // Check if code already exists
    const existing = await orderRepo.findOne({ where: { orderCode: code } });
    if (existing) {
      return this.generateOrderCode(); // Recursively generate new code
    }

    return code;
  }
}

module.exports = new OrderService();
