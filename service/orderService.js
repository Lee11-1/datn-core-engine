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
        warehouseId: item.warehouseId || null,
      });
      await orderItemRepo.save(orderItem);
    }

    const orderWithItems = await orderRepo.findOne({
      where: { id: savedOrder.id },
      relations: ['session', 'user', 'customer', 'items', 'items.product'],
    });

    return orderWithItems;
  }

  async getOrders(query) {
    const { page = 1, limit = 10, userId, customerId, sessionId, status, scheduleId } = query;
    const orderRepo = getRepository('Order');
    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .orderBy('order.createdAt', 'DESC')
      .take(parseInt(limit))
      .skip(((parseInt(page) - 1 )* parseInt(limit)));
      
    if (scheduleId) {
      queryBuilder
      .leftJoinAndSelect('order.session', 'session')
      .andWhere('session.scheduleId = :scheduleId', { scheduleId });
    }
    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId })
      .andWhere(
          `order.created_at >= NOW() - INTERVAL '5 months'`
        );
    }

    if (customerId) {
      queryBuilder
        .andWhere('order.customerId = :customerId', { customerId })
        .andWhere(
          `order.created_at >= NOW() - INTERVAL '5 months'`
        );
    }

    if (sessionId) {
      queryBuilder.andWhere('order.sessionId = :sessionId', { sessionId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

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

  async getOrdersBySchedule(scheduleId) {
    const orderRepo = getRepository('Order');

    const results = await orderRepo
      .createQueryBuilder('order')
      .leftJoin('order.session', 'session')
      .leftJoin('order.customer', 'customer')
      .where('session.scheduleId = :scheduleId', { scheduleId })
      .select('customer.id', 'customerId')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .groupBy('customer.id')
      .getRawMany();

    return {
      results,
    };
  }

  async getOrdersBySession(sessionId) {
    const orderRepo = getRepository('Order');

    const orders = await orderRepo.find({
      where: { sessionId },
      relations: ['session', 'user', 'customer', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
    });

    return orders;
  }

  async getOrdersByUser(userId, queryParams = {}) {
    const { page = 1, limit = 10 } = queryParams;
    const orderRepo = getRepository('Order');

    const [orders, total] = await orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.userId = :userId', { userId })
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

 async getOrderDetail(orderId) {
  const orderRepo = getRepository('Order');
  console.log('Fetching order detail for orderId:', orderId); 
  const order = await orderRepo
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.session', 'session')
    .leftJoinAndSelect('order.user', 'user')
    .leftJoinAndSelect('order.customer', 'customer')
    .leftJoinAndSelect('order.items', 'items')
    .leftJoinAndSelect('items.product', 'product')
    .leftJoinAndSelect('order.warehouse', 'warehouse')
    .leftJoinAndSelect('order.approver', 'approver')
   .leftJoinAndSelect('items.warehouse', 'itemWarehouse')
    .leftJoinAndMapOne(
      'items.inventory',
      'Inventory',
      'inventory',
      `
      inventory.product_id = items.product_id
      AND inventory.warehouse_id = items.warehouse_id
      `
    )


    .where('order.id = :orderId', { orderId })

    .getOne();

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
}

async getOrderItems(orderId){
   const orderRepo = getRepository('Order');
  console.log('Fetching order detail for orderId:', orderId); 
  const order = await orderRepo
    .createQueryBuilder('order')
    .leftJoinAndSelect('order.items', 'items')
    .leftJoinAndMapOne(
      'items.inventory',
      'Inventory',
      'inventory',
      `
      inventory.product_id = items.product_id
      AND inventory.warehouse_id = items.warehouse_id
      `
    )
    .where('order.id = :orderId', { orderId })

    .getOne();

  if (!order) {
    throw new Error('Order not found');
  }

  return order.items;
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
