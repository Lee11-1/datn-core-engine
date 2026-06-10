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
    const { page = 1, limit = 10, zoneId, isActive, search_text } = query;
    const warehouseRepo = getRepository('Warehouse');

    let queryBuilder = warehouseRepo.createQueryBuilder('warehouse').where('warehouse.deleted = false');

    if (zoneId) {
      queryBuilder = queryBuilder.andWhere('warehouse.zoneId = :zoneId', { zoneId });
    }

    if (isActive !== undefined) {
      const isActiveValue = isActive === 'true' || isActive === true;
      queryBuilder = queryBuilder.andWhere('warehouse.isActive = :isActive', { isActive: isActiveValue });
    }

    if (search_text) {
        queryBuilder = queryBuilder.andWhere('(warehouse.name ILIKE :search_text OR warehouse.code ILIKE :search_text)', { search_text: `%${search_text}%` });
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
    warehouse.deleted = true;
   
    return  await warehouseRepo.save(warehouse);
  }

}

module.exports = new WarehouseService();
