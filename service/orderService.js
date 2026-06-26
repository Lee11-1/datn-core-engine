const { getRepository } = require('../config/typeorm');
const { AppDataSource } = require('../config/database');
const { In } = require('typeorm');
class OrderService {
  async createOrder(orderData) {
    const { sessionId, userId, customerId, orderPhotoUrl, orderLocation, items, totalAmount, discountAmount, finalAmount, promotionId } = orderData;

    if (!sessionId || !userId || !customerId || !orderPhotoUrl || !items || !items.length) {
      throw new Error('Missing required fields: sessionId, userId, customerId, orderPhotoUrl, items');
    }

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [session, user, customer] = await Promise.all([
        queryRunner.manager.findOne('SellingSession', { where: { id: sessionId } }),
        queryRunner.manager.findOne('User', { where: { id: userId } }),
        queryRunner.manager.findOne('Customer', { where: { id: customerId } })
      ]);
      if (!session) {
        throw new Error('Selling session not found');
      }
      if (!user) {
        throw new Error('User not found');
      }
      if (!customer) {
        throw new Error('Customer not found');
      }

      const productIds = items.map(item => item.productId);

      const products = await queryRunner.manager.find('Product', {
        where: {
          id: In(productIds)
        }
      });

      if (products.length !== productIds.length) {
        throw new Error('One or more products not found');
      }
      const orderCode = await this.generateOrderCode();

      let location = null;
      if (orderLocation && orderLocation.coordinates) {
        location = {
          type: 'Point',
          coordinates: orderLocation.coordinates,
        };
      }

      const orderRepository = queryRunner.manager.getRepository('Order');

      const order = orderRepository.create({
        orderCode,
        sessionId,
        userId,
        customerId,
        orderPhotoUrl,
        orderLocation: location,
        totalAmount,
        discountAmount,
        finalAmount,
        status: 'pending',
        promotionId: promotionId || null
      });

      const savedOrder = await orderRepository.save(order);

      await queryRunner.manager
      .getRepository('OrderItem')
      .insert(
        items.map(item => ({
          orderId: savedOrder.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          costPrice: item.costPrice || null,
          discount: item.discount || 0,
          subtotal: item.subtotal || item.price * item.quantity,
          warehouseId: item.warehouseId || null
        }))
      );

   const values = items
      .map(
        i =>
          `('${i.productId}'::uuid, '${i.warehouseId}'::uuid, ${i.quantity})`
      )
      .join(',');

      await queryRunner.query(`
        UPDATE inventory i
        SET reserved_qty = i.reserved_qty + v.quantity
        FROM (
            VALUES ${values}
        ) AS v(product_id, warehouse_id, quantity)
        WHERE i.product_id = v.product_id
          AND i.warehouse_id = v.warehouse_id;
        `);

      if (promotionId) {
        await queryRunner.manager
          .createQueryBuilder()
          .update('Promotion')
          .set({
            usedCount: () => '"used_count" + 1'
          })
          .where('id = :id', { id: promotionId })
          .execute();
      }

      await queryRunner.commitTransaction();

      return savedOrder;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOrders(query) {
    const { page = 1, limit = 10, userId, customerId, sessionId, status, scheduleId, startDate, endDate } = query;
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

    if (startDate && endDate) {
      queryBuilder.andWhere(
        'order.createdAt >= :startDate AND order.createdAt < :endDate',
        { startDate, endDate }
      )
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
      .leftJoin('order.commission', 'commission')
      .where('session.scheduleId = :scheduleId', { scheduleId })
      .select('customer.id', 'customerId')
      .addSelect('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.finalAmount)', 'totalAmount')
      .addSelect('SUM(commission.commissionAmount)', 'totalCommission')
      .addSelect(`
        SUM(
          CASE
            WHEN order.status = 'approved' THEN 1
            ELSE 0
          END
        )
      `, 'approvedOrders')

      .addSelect(`
        SUM(
          CASE
            WHEN order.status = 'rejected'
            THEN 1
            ELSE 0
          END
        )
      `, 'rejectedOrders')

      .addSelect(`
        SUM(
          CASE
            WHEN order.status = 'pending' THEN 1
            ELSE 0
          END
        )
      `, 'pendingOrders')
          .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'fail' THEN 1
              ELSE 0
            END
          )
        `, 'failOrders')
          .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'success' THEN 1
              ELSE 0
            END
          )
        `, 'successOrders')
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
    const { page = 1, limit = 10, status } = queryParams;
    const orderRepo = getRepository('Order');

    const [orders, total] = await orderRepo.createQueryBuilder('order')
      .leftJoinAndSelect('order.customer', 'customer')
      .where('order.userId = :userId', { userId })
      .andWhere('order.status = :status', { status: status || 'approved' })
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
    const { status, rejectReason, rejectNote, approvedBy, note, failReason } = data;
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try{
      const orderRepo = queryRunner.manager.getRepository('Order');

      const order = await orderRepo.findOne({ where: { id: orderId }, relations: ['items'] });
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

      if (failReason) {
        order.failReason = failReason;
      }

      if (status === 'fail') {
        const inventoryRepo = queryRunner.manager.getRepository('Inventory');
        const orderItems = order.items;
        const values = orderItems
          .map(
            i =>
              `('${i.productId}'::uuid, '${i.warehouseId}'::uuid, ${i.quantity})`
          )
          .join(',');

        await queryRunner.query(`
          UPDATE inventory i
          SET quantity = i.quantity + v.quantity
          FROM (
              VALUES ${values}
          ) AS v(product_id, warehouse_id, quantity)
          WHERE i.product_id = v.product_id
            AND i.warehouse_id = v.warehouse_id;
          `);
      }
      const savedOrder = await orderRepo.save(order);
      await queryRunner.commitTransaction();

      return savedOrder;
    }
    catch( error ){
      await queryRunner.rollbackTransaction();
      throw error;
    }
    finally {
      await queryRunner.release();
    }
    
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

 
async getTopCustomersOrderByZone(zoneId, query = {}) {
  try {
    const { startDate, endDate, status = 'success', scheduleId } = query;

    const orderRepo = getRepository('Order');

    let queryBuilder = orderRepo
      .createQueryBuilder('order')

      .leftJoin('order.customer', 'customer')
      .leftJoin('customer.zone', 'zone')

      .select([
        'customer.id as customerId',
        'customer.fullName as fullName',
        'customer.phone as phone',
        'customer.email as email',
        'customer.address as address',
        'COUNT(order.id) as orderCount',
        'SUM(order.finalAmount) as totalRevenue'
      ])
      .addSelect(
        'ST_AsGeoJSON(customer.location)',
        'location'
      )

      .where('zone.id = :zoneId', { zoneId })

      .groupBy('customer.id')
      .addGroupBy('customer.fullName')
      .addGroupBy('customer.phone')
      .addGroupBy('customer.email')
      .addGroupBy('customer.address')
      .addGroupBy('customer.location')

      .orderBy('totalRevenue', 'DESC')
      .limit(3);

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere(
        'order.createdAt >= :startDate',
        { startDate }
      );
    }

    if (endDate) {
      queryBuilder.andWhere(
        'order.createdAt <= :endDate',
        { endDate }
      );
    }

    if (scheduleId) {
      queryBuilder
        .leftJoin('order.session', 'session')
        .andWhere('session.scheduleId = :scheduleId', { scheduleId });
    }

    const result = await queryBuilder.getRawMany();

    return result;

  } catch (error) {
    throw error;
  }
}

  approveOrder = async (orderId, approvedBy, note = '', inventories) => {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

  try {
    const orderRepo = queryRunner.manager.getRepository('Order');
    const order = await orderRepo.findOne({ where: { id: orderId } });

    if (!order || order.status !== 'pending') {
      throw new Error('Order not found');
    }
      order.status = 'approved';

      order.approvedAt = new Date();
      order.approvedBy = approvedBy || null;

    if (note) {
      order.note = note;
    }

    const updatedOrder = await orderRepo.save(order);
    const inventoryRepository = queryRunner.manager.getRepository('Inventory');

    const updatedInventories = [];

    for (const updateData of inventories) {

      const { id, ...data } = updateData;

      const inventory = await inventoryRepository.findOne({
        where: { id }
      });

      if (!inventory) {
        throw new Error(`Inventory ${id} not found`);
      }

      inventory.quantity = data.quantity;
      inventory.reservedQty = data.reservedQty;

      const updated = await inventoryRepository.save(inventory);

      updatedInventories.push(updated);
    }

    await queryRunner.commitTransaction();

    return updatedOrder;

  } catch (error) {

    await queryRunner.rollbackTransaction();

    throw error;

  } finally {

    await queryRunner.release();

  }
  }

  async getTopRevenueZones(query){
    try {
      const { startDate, endDate } = query;
      const orderRepo = getRepository('Order');
      const result = await orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.session', 'session')
        .leftJoin('session.schedule', 'schedule')
        .leftJoin('schedule.zone', 'zone')
        .leftJoin('schedule.user', 'user')
        .select('zone.id', 'zoneId')
        .addSelect('zone.name', 'zoneName')
        .addSelect('SUM(order.finalAmount)', 'totalRevenue')
        .addSelect('user.id', 'userId')
        .addSelect('user.phone', 'userPhone')
        .addSelect('user.fullName', 'userFullName')
        .where('order.status = :status', { status: 'success' })
        .andWhere('order.createdAt >= :startDate', { startDate })
        .andWhere('order.createdAt <= :endDate', { endDate })
        .groupBy('zone.id')
        .addGroupBy('user.id')
        .addGroupBy('user.fullName')
        .addGroupBy('user.phone')
        .orderBy('SUM(order.finalAmount)', 'DESC')
        .limit(3)
        .getRawMany();

      return result;
    }catch(error){
      throw error;
    }
  }

  async getOrderStatistics(query) {
    try {
     const { zoneId, startDate, endDate } = query
      const orderRepo = getRepository('Order');

      const queryBuilder = orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.session', 'session')
        .leftJoin('session.schedule', 'schedule')
        .where('schedule.status = :scheduleStatus', {
          scheduleStatus: 'ongoing'
        })

        .select('COUNT(order.id)', 'totalOrders')
        .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'approved' THEN 1
              ELSE 0
            END
          )
        `, 'approvedOrders')

        .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'rejected' THEN 1
              ELSE 0
            END
          )
        `, 'rejectedOrders')

        .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'pending' THEN 1
              ELSE 0
            END
          )
        `, 'pendingOrders')
          .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'fail' THEN 1
              ELSE 0
            END
          )
        `, 'failOrders')
          .addSelect(`
          SUM(
            CASE
              WHEN order.status = 'success' THEN 1
              ELSE 0
            END
          )
        `, 'successOrders')

      if (zoneId) {
        queryBuilder.andWhere('schedule.zoneId = :zoneId', {
          zoneId
        })
      }

      if (startDate) {
        queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
      }
      if (endDate) {
        queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
      }

      const data1 = await queryBuilder.getRawOne()

      const data2 = await orderRepo
        .createQueryBuilder('order')
        .leftJoin('order.session', 'session')
        .leftJoin('session.schedule', 'schedule')
        .where('schedule.status = :scheduleStatus', {
          scheduleStatus: 'ongoing'
        })
        .andWhere('order.createdAt >= :startDate', { startDate })
        .andWhere('order.createdAt <= :endDate', { endDate })
        .select("DATE(order.createdAt)", "date")
        .addSelect("COUNT(order.id)", "totalOrders")
        .groupBy("DATE(order.createdAt)")
        .orderBy("DATE(order.createdAt)", "ASC")
        .getRawMany();
      return {statistics: data1, dailyData: data2 };
    }catch (error) {
      throw error;
    }
  }


}

module.exports = new OrderService();
