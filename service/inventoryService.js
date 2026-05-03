const { getRepository } = require('../config/typeorm');
const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');

class InventoryService {
  /**
   * Get inventory records with filters and pagination
   */
  async getInventory(query) {
    try {
      const { search_text, page = 1, limit = 10, productId, warehouseId } = query;
      const inventoryRepository = getRepository(Inventory);

      let queryBuilder = inventoryRepository.createQueryBuilder('inv')
        .leftJoinAndSelect('inv.product', 'product')
        .leftJoinAndSelect('inv.warehouse', 'warehouse');

      if (productId) {
        queryBuilder = queryBuilder.andWhere('inv.productId = :productId', { productId });
      }

      if (warehouseId) {
        queryBuilder = queryBuilder.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
      }

      if (search_text) {
        queryBuilder = queryBuilder.andWhere(
          '(product.name ILIKE :search_text OR warehouse.name ILIKE :search_text)',
          { search_text: `%${search_text}%` }
        );
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const [inventory, total] = await queryBuilder
        .orderBy('inv.updatedAt', 'DESC')
        .skip(skip)
        .take(parseInt(limit))
        .getManyAndCount();

      return {
        inventory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get inventory: ${error.message}`);
    }
  }

  /**
   * Get single inventory record
   */
  async getInventoryById(inventoryId) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await inventoryRepository.findOne({
        where: { id: inventoryId },
        relations: ['product', 'warehouse'],
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Failed to get inventory: ${error.message}`);
    }
  }

  /**
   * Get inventory by product and warehouse
   */
  async getInventoryByProductAndWarehouse(productId, warehouseId) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await inventoryRepository.findOne({
        where: { productId, warehouseId },
        relations: ['product', 'warehouse'],
      });

      if (!inventory) {
        throw new Error('Inventory not found for this product and warehouse');
      }

      return inventory;
    } catch (error) {
      throw new Error(`Failed to get inventory: ${error.message}`);
    }
  }

  /**
   * Check available quantity (quantity - reservedQty)
   */
  async checkAvailableQuantity(productId, warehouseId) {
    try {
      const inventory = await this.getInventoryByProductAndWarehouse(productId, warehouseId);
      const availableQty = inventory.quantity - inventory.reservedQty;

      return {
        totalQuantity: inventory.quantity,
        reservedQuantity: inventory.reservedQty,
        availableQuantity: availableQty > 0 ? availableQty : 0,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reserve inventory quantity (used when order is placed)
   */
  async reserveQuantity(productId, warehouseId, quantity, userId = null, orderId = null) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await this.getInventoryByProductAndWarehouse(productId, warehouseId);

      // Check available quantity
      const availableQty = inventory.quantity - inventory.reservedQty;
      if (availableQty < quantity) {
        throw new Error(
          `Insufficient available quantity. Available: ${availableQty}, Requested: ${quantity}`
        );
      }

      // Update reserved quantity
      inventory.reservedQty = inventory.reservedQty + quantity;
      const updated = await inventoryRepository.save(inventory);

      // Log activity
      await this.logInventoryActivity(
        'RESERVE',
        productId,
        warehouseId,
        quantity,
        userId,
        {
          orderId,
          previousReserved: inventory.reservedQty - quantity,
          newReserved: inventory.reservedQty,
        }
      );

      return {
        success: true,
        message: `Reserved ${quantity} units successfully`,
        inventory: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Deduct inventory (used when order is shipped/delivered)
   */
  async deductQuantity(productId, warehouseId, quantity, userId = null, orderId = null) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await this.getInventoryByProductAndWarehouse(productId, warehouseId);

      // Check if reserved quantity is sufficient
      if (inventory.reservedQty < quantity) {
        throw new Error(
          `Insufficient reserved quantity. Reserved: ${inventory.reservedQty}, Requested: ${quantity}`
        );
      }

      // Update quantity and reserved quantity
      const previousQty = inventory.quantity;
      inventory.quantity = inventory.quantity - quantity;
      inventory.reservedQty = inventory.reservedQty - quantity;

      const updated = await inventoryRepository.save(inventory);

      // Log activity
      await this.logInventoryActivity(
        'DEDUCT',
        productId,
        warehouseId,
        quantity,
        userId,
        {
          orderId,
          previousQty,
          newQty: inventory.quantity,
          previousReserved: inventory.reservedQty + quantity,
          newReserved: inventory.reservedQty,
        }
      );

      return {
        success: true,
        message: `Deducted ${quantity} units successfully`,
        inventory: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add inventory quantity (used for stock in/replenishment)
   */
  async createQuantity(productId, warehouseId, quantity, userId = null,) {
    try {
      const inventoryRepository = getRepository(Inventory);
      let inventory = await inventoryRepository.findOne({
        where: { productId, warehouseId },
        relations: ['product', 'warehouse'],
      });

      if (!inventory) {
        inventory = inventoryRepository.create({
          productId,
          warehouseId,
          quantity,
          reservedQty: 0,
        });
      } else {
        inventory.quantity = inventory.quantity + quantity;
      }

      const previousQty = inventory.quantity - quantity;
      const updated = await inventoryRepository.save(inventory);

      await this.logInventoryActivity(
        'ADD',
        productId,
        warehouseId,
        quantity,
        userId,
        {
          previousQty,
          newQty: inventory.quantity
        }
      );

      return {
        success: true,
        message: `Added ${quantity} units successfully`,
        inventory: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteInventory(inventoryId, userId) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await inventoryRepository.findOne({ where: { id: inventoryId } });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      await inventoryRepository.remove(inventory);

      await this.logInventoryActivity(
        'DELETE',
        inventory.productId,
        inventory.warehouseId,
        inventory.quantity,
        userId
      );

      return {
        success: true,
        message: 'Inventory deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Release reserved quantity (used when order is cancelled)
   */
  async releaseReservedQuantity(productId, warehouseId, quantity, userId = null, orderId = null) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await this.getInventoryByProductAndWarehouse(productId, warehouseId);

      // Check if reserved quantity is sufficient
      if (inventory.reservedQty < quantity) {
        throw new Error(
          `Cannot release ${quantity} units. Only ${inventory.reservedQty} units reserved`
        );
      }

      // Update reserved quantity
      inventory.reservedQty = inventory.reservedQty - quantity;
      const updated = await inventoryRepository.save(inventory);

      // Log activity
      await this.logInventoryActivity(
        'RELEASE',
        productId,
        warehouseId,
        quantity,
        userId,
        {
          orderId,
          previousReserved: inventory.reservedQty + quantity,
          newReserved: inventory.reservedQty,
        }
      );

      return {
        success: true,
        message: `Released ${quantity} reserved units successfully`,
        inventory: updated,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inventory movement history
   */
  async getInventoryMovementHistory(filters = {}) {
    try {
      const activityLogRepository = getRepository(ActivityLog);
      const query = activityLogRepository.createQueryBuilder('log')
        .where('log.action IN (:...actions)', {
          actions: ['RESERVE', 'DEDUCT', 'ADD', 'RELEASE'],
        })
        .orderBy('log.createdAt', 'DESC');

      if (filters.productId) {
        query.andWhere('log.metadata @> :metadata', {
          metadata: JSON.stringify({ productId: filters.productId }),
        });
      }

      if (filters.warehouseId) {
        query.andWhere('log.metadata @> :metadata', {
          metadata: JSON.stringify({ warehouseId: filters.warehouseId }),
        });
      }

      if (filters.action) {
        query.andWhere('log.action = :action', { action: filters.action });
      }

      if (filters.limit) {
        query.limit(filters.limit);
      }

      const history = await query.getMany();
      return history;
    } catch (error) {
      throw new Error(`Failed to get inventory movement history: ${error.message}`);
    }
  }

  /**
   * Log inventory activity
   */
  async logInventoryActivity(action, productId, warehouseId, quantity, userId = null, metadata = {}) {
    try {
      const activityLogRepository = getRepository(ActivityLog);

      const log = activityLogRepository.create({
        userId,
        action,
        entityType: 'Inventory',
        level: 'info',
        metadata: {
          productId,
          warehouseId,
          quantity,
          ...metadata,
        },
      });

      await activityLogRepository.save(log);
    } catch (error) {
      console.error(`Failed to log inventory activity: ${error.message}`);
      // Don't throw error, just log it
    }
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(threshold = 10) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const lowStock = await inventoryRepository
        .createQueryBuilder('inv')
        .leftJoinAndSelect('inv.product', 'product')
        .leftJoinAndSelect('inv.warehouse', 'warehouse')
        .where('inv.quantity - inv.reserved_qty <= :threshold', { threshold })
        .orderBy('inv.quantity', 'ASC')
        .getMany();

      return lowStock;
    } catch (error) {
      throw new Error(`Failed to get low stock products: ${error.message}`);
    }
  }

  /**
   * Get inventory summary by warehouse
   */
  async getInventorySummaryByWarehouse(warehouseId) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const summary = await inventoryRepository
        .createQueryBuilder('inv')
        .leftJoinAndSelect('inv.product', 'product')
        .leftJoinAndSelect('inv.warehouse', 'warehouse')
        .where('inv.warehouseId = :warehouseId', { warehouseId })
        .select([
          'warehouse.id',
          'warehouse.name',
          'COUNT(inv.id) as totalSKUs',
          'SUM(inv.quantity) as totalQuantity',
          'SUM(inv.reserved_qty) as totalReserved',
        ])
        .groupBy('warehouse.id, warehouse.name')
        .getRawOne();

      return summary || null;
    } catch (error) {
      throw new Error(`Failed to get warehouse inventory summary: ${error.message}`);
    }
  }

  /**
   * Transfer inventory between warehouses
   */
  async transferInventory(productId, fromWarehouseId, toWarehouseId, quantity, userId = null) {
    try {
      // Deduct from source warehouse
      await this.deductQuantity(productId, fromWarehouseId, quantity, userId, null);

      await this.createQuantity(
        productId,
        toWarehouseId,
        quantity,
        userId,
        `Transferred from warehouse ${fromWarehouseId}`
      );

      return {
        success: true,
        message: `Transferred ${quantity} units successfully`,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update inventory record (quantity and/or reservedQty)
   */
  async updateInventory(inventoryId, updateData = {}) {
    try {
      const inventoryRepository = getRepository(Inventory);
      const inventory = await inventoryRepository.findOne({
        where: { id: inventoryId },
        relations: ['product', 'warehouse'],
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      const { quantity, reservedQty, userId } = updateData;
      const changes = {};
      const previousData = {};

      // Update quantity if provided
      if (quantity !== undefined && quantity !== null) {
        if (quantity < 0) {
          throw new Error('Quantity cannot be negative');
        }
        previousData.quantity = inventory.quantity;
        inventory.quantity = quantity;
        changes.quantity = quantity;
      }

      // Update reserved quantity if provided
      if (reservedQty !== undefined && reservedQty !== null) {
        if (reservedQty < 0) {
          throw new Error('Reserved quantity cannot be negative');
        }
        // Check that reserved quantity doesn't exceed total quantity
        const totalQty = quantity !== undefined ? quantity : inventory.quantity;
        if (reservedQty > totalQty) {
          throw new Error(
            `Reserved quantity (${reservedQty}) cannot exceed total quantity (${totalQty})`
          );
        }
        previousData.reservedQty = inventory.reservedQty;
        inventory.reservedQty = reservedQty;
        changes.reservedQty = reservedQty;
      }

      const updated = await inventoryRepository.save(inventory);

      // Log activity
      await this.logInventoryActivity(
        'UPDATE',
        inventory.productId,
        inventory.warehouseId,
        0,
        userId,
        {
          changes,
          previousData
        }
      );

      return updated;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new InventoryService();
