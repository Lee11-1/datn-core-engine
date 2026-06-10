const { getRepository } = require('../config/typeorm');
const Inventory = require('../models/Inventory');
const ActivityLog = require('../models/ActivityLog');
const Product = require('../models/Product');
const Warehouse = require('../models/Warehouse');
const { AppDataSource } = require('../config/database');
class InventoryService {

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

      if (reservedQty !== undefined && reservedQty !== null) {
        if (reservedQty < 0) {
          throw new Error('Reserved quantity cannot be negative');
        }
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
