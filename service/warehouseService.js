const { getRepository } = require('../config/typeorm');

class WarehouseService {
  async createWarehouse(warehouseData) {
    const { name, code, address, location, zoneId, managerId, isActive } = warehouseData;

    if (!name || !code) {
      throw new Error('Missing required fields: name, code');
    }

    const warehouseRepo = getRepository('Warehouse');
    
    const existingWarehouse = await warehouseRepo.findOne({
      where: { code }
    });

    if (existingWarehouse) {
      throw new Error('Warehouse code already exists');
    }

    if (zoneId) {
      const zoneRepo = getRepository('Zone');
      const zone = await zoneRepo.findOne({ where: { id: zoneId } });
      if (!zone) {
        throw new Error('Zone not found');
      }
    }

    if (managerId) {
      const userRepo = getRepository('User');
      const manager = await userRepo.findOne({ where: { id: managerId } });
      if (!manager) {
        throw new Error('Manager not found');
      }
    }

    const newWarehouse = warehouseRepo.create({
      name,
      code,
      address: address || null,
      location: location || null,
      zoneId: zoneId || null,
      managerId: managerId || null,
      isActive: isActive !== undefined ? isActive : true,
    });

    return await warehouseRepo.save(newWarehouse);
  }

  async getWarehouses(query) {
    const { page = 1, limit = 10, zoneId, isActive, search } = query;
    const warehouseRepo = getRepository('Warehouse');

    const where = {};
    if (zoneId) where.zoneId = zoneId;
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    let queryBuilder = warehouseRepo.createQueryBuilder('warehouse');

    if (zoneId) {
      queryBuilder = queryBuilder.where('warehouse.zoneId = :zoneId', { zoneId });
    }

    if (isActive !== undefined) {
      const isActiveValue = isActive === 'true' || isActive === true;
      if (zoneId) {
        queryBuilder = queryBuilder.andWhere('warehouse.isActive = :isActive', { isActive: isActiveValue });
      } else {
        queryBuilder = queryBuilder.where('warehouse.isActive = :isActive', { isActive: isActiveValue });
      }
    }

    if (search) {
      if (zoneId || isActive !== undefined) {
        queryBuilder = queryBuilder.andWhere('(warehouse.name ILIKE :search OR warehouse.code ILIKE :search)', { search: `%${search}%` });
      } else {
        queryBuilder = queryBuilder.where('(warehouse.name ILIKE :search OR warehouse.code ILIKE :search)', { search: `%${search}%` });
      }
    }

    queryBuilder = queryBuilder.leftJoinAndSelect('warehouse.zone', 'zone')
      .leftJoinAndSelect('warehouse.manager', 'manager')
      .orderBy('warehouse.createdAt', 'DESC')
      .take(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const [warehouses, total] = await queryBuilder.getManyAndCount();

    return {
      warehouses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getWarehouseById(id) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({
      where: { id },
      relations: ['zone', 'manager'],
    });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return warehouse;
  }

  async updateWarehouse(id, updates) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    // Check if code is being changed and validate uniqueness
    if (updates.code && updates.code !== warehouse.code) {
      const existingWarehouse = await warehouseRepo.findOne({
        where: { code: updates.code }
      });

      if (existingWarehouse) {
        throw new Error('Warehouse code already exists');
      }
    }

    // Validate zone if provided
    if (updates.zoneId && updates.zoneId !== warehouse.zoneId) {
      const zoneRepo = getRepository('Zone');
      const zone = await zoneRepo.findOne({ where: { id: updates.zoneId } });
      if (!zone) {
        throw new Error('Zone not found');
      }
    }

    // Validate manager if provided
    if (updates.managerId && updates.managerId !== warehouse.managerId) {
      const userRepo = getRepository('User');
      const manager = await userRepo.findOne({ where: { id: updates.managerId } });
      if (!manager) {
        throw new Error('Manager not found');
      }
    }

    Object.assign(warehouse, updates);
    return await warehouseRepo.save(warehouse);
  }

  async deleteWarehouse(id) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return await warehouseRepo.remove(warehouse);
  }

  async getWarehousesByZone(zoneId, query = {}) {
    const { page = 1, limit = 10, isActive } = query;
    const warehouseRepo = getRepository('Warehouse');

    const where = { zoneId };
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    const [warehouses, total] = await warehouseRepo.findAndCount({
      where,
      relations: ['zone', 'manager'],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
    });

    return {
      warehouses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getWarehousesByManager(managerId, query = {}) {
    const { page = 1, limit = 10, isActive } = query;
    const warehouseRepo = getRepository('Warehouse');

    const where = { managerId };
    if (isActive !== undefined) where.isActive = isActive === 'true' || isActive === true;

    const [warehouses, total] = await warehouseRepo.findAndCount({
      where,
      relations: ['zone', 'manager'],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
    });

    return {
      warehouses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async assignManager(warehouseId, managerId) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const userRepo = getRepository('User');
    const manager = await userRepo.findOne({ where: { id: managerId } });

    if (!manager) {
      throw new Error('Manager not found');
    }

    warehouse.managerId = managerId;
    return await warehouseRepo.save(warehouse);
  }

  async removeManager(warehouseId) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    warehouse.managerId = null;
    return await warehouseRepo.save(warehouse);
  }

  async assignZone(warehouseId, zoneId) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    const zoneRepo = getRepository('Zone');
    const zone = await zoneRepo.findOne({ where: { id: zoneId } });

    if (!zone) {
      throw new Error('Zone not found');
    }

    warehouse.zoneId = zoneId;
    return await warehouseRepo.save(warehouse);
  }

  async removeZone(warehouseId) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    warehouse.zoneId = null;
    return await warehouseRepo.save(warehouse);
  }

  async toggleWarehouseStatus(id, isActive) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    warehouse.isActive = isActive;
    return await warehouseRepo.save(warehouse);
  }

  async getWarehouseByCode(code) {
    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({
      where: { code },
      relations: ['zone', 'manager'],
    });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    return warehouse;
  }

  async getWarehouseStatistics() {
    const warehouseRepo = getRepository('Warehouse');

    const total = await warehouseRepo.count();
    const active = await warehouseRepo.count({ where: { isActive: true } });
    const inactive = await warehouseRepo.count({ where: { isActive: false } });

    // Count warehouses by zone
    const byZone = await warehouseRepo
      .createQueryBuilder('warehouse')
      .select('warehouse.zoneId', 'zoneId')
      .addSelect('COUNT(*)', 'count')
      .groupBy('warehouse.zoneId')
      .getRawMany();

    return {
      total,
      active,
      inactive,
      byZone,
    };
  }

  async searchWarehouses(searchTerm, query = {}) {
    const { page = 1, limit = 10 } = query;
    const warehouseRepo = getRepository('Warehouse');

    const [warehouses, total] = await warehouseRepo
      .createQueryBuilder('warehouse')
      .where('warehouse.name ILIKE :search OR warehouse.code ILIKE :search', { search: `%${searchTerm}%` })
      .leftJoinAndSelect('warehouse.zone', 'zone')
      .leftJoinAndSelect('warehouse.manager', 'manager')
      .orderBy('warehouse.createdAt', 'DESC')
      .take(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .getManyAndCount();

    return {
      warehouses,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async bulkCreateWarehouses(warehousesData) {
    if (!Array.isArray(warehousesData) || warehousesData.length === 0) {
      throw new Error('warehousesData must be a non-empty array');
    }

    const warehouseRepo = getRepository('Warehouse');
    
    // Validate all data first
    for (const warehouse of warehousesData) {
      if (!warehouse.name || !warehouse.code) {
        throw new Error('Each warehouse must have name and code');
      }

      const existingWarehouse = await warehouseRepo.findOne({
        where: { code: warehouse.code }
      });

      if (existingWarehouse) {
        throw new Error(`Warehouse code ${warehouse.code} already exists`);
      }

      if (warehouse.zoneId) {
        const zoneRepo = getRepository('Zone');
        const zone = await zoneRepo.findOne({ where: { id: warehouse.zoneId } });
        if (!zone) {
          throw new Error(`Zone ${warehouse.zoneId} not found`);
        }
      }

      if (warehouse.managerId) {
        const userRepo = getRepository('User');
        const manager = await userRepo.findOne({ where: { id: warehouse.managerId } });
        if (!manager) {
          throw new Error(`Manager ${warehouse.managerId} not found`);
        }
      }
    }

    // Create all warehouses
    const warehouses = warehousesData.map(data =>
      warehouseRepo.create({
        name: data.name,
        code: data.code,
        address: data.address || null,
        location: data.location || null,
        zoneId: data.zoneId || null,
        managerId: data.managerId || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      })
    );

    const savedWarehouses = await warehouseRepo.save(warehouses);

    return {
      success: true,
      count: savedWarehouses.length,
      warehouses: savedWarehouses,
    };
  }
}

module.exports = new WarehouseService();
