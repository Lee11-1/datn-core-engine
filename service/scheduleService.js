const { getRepository } = require('../config/typeorm');

class ScheduleService {
  async createMultiSchedules(scheduleData) {
    const { userId, zoneId, warehouseId, scheduledDate, startTime, endTime, status, note, createdBy } = scheduleData;

    if (!userId || !zoneId || !scheduledDate || !startTime || !endTime || !createdBy) {
      throw new Error('Missing required fields: userId, zoneId, scheduledDate, startTime, endTime, createdBy');
    }

    if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
      throw new Error('Invalid time format. Use HH:mm:ss format');
    }

    if (startTime >= endTime) {
      throw new Error('Start time must be before end time');
    }

    const scheduleRepo = getRepository('Schedule');
    
    const userRepo = getRepository('User');
    const zoneRepo = getRepository('Zone');
    
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const zone = await zoneRepo.findOne({ where: { id: zoneId } });
    if (!zone) {
      throw new Error('Zone not found');
    }

    if (warehouseId) {
      const warehouseRepo = getRepository('Warehouse');
      const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });
      if (!warehouse) {
        throw new Error('Warehouse not found');
      }
    }

    const newSchedule = scheduleRepo.create({
      userId,
      zoneId,
      warehouseId: warehouseId || null,
      scheduledDate,
      startTime,
      endTime,
      status: status || 'planned',
      note: note || null,
      createdBy,
    });

    return await scheduleRepo.save(newSchedule);
  }

  async createSchedule(scheduleData) {
    const { userId, zoneId, warehouseId, startDate, endDate, status, note, createdBy } = scheduleData;

    if (!userId || !zoneId || !startDate || !endDate || !createdBy ) {
      throw new Error('Missing required fields: userId, zoneId, startDate, endDate, createdBy');
    }


    if (!this.isValidDateFormat(startDate) || !this.isValidDateFormat(endDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD format');
    }

    if (startDate >= endDate) {
      throw new Error('Start date must be before end date');
    }


    const scheduleRepo = getRepository('Schedule');
    
    const userRepo = getRepository('User');
    const zoneRepo = getRepository('Zone');
    
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const zone = await zoneRepo.findOne({ where: { id: zoneId } });
    if (!zone) {
      throw new Error('Zone not found');
    }

    if (warehouseId) {
      const warehouseRepo = getRepository('Warehouse');
      const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });
      if (!warehouse) {
        throw new Error('Warehouse not found');
      }
    }

    const schedule =  scheduleRepo.create({
                            userId,
                            zoneId,
                            warehouseId: warehouseId || null,
                            startDate,
                            endDate,
                            status: status || 'planned',
                            note: note || null,
                            createdBy,
                        })
    
    const savedSchedule = await scheduleRepo.save(schedule);
    
    return {
      success: true,
      schedule: savedSchedule,
    };
  }

  async getSchedules(query) {
    const { page = 1, limit = 10, userId, zoneId, status, scheduledDate, warehouseId } = query;
    const scheduleRepo = getRepository('Schedule');

    const where = {};
    if (userId) where.userId = userId;
    if (zoneId) where.zoneId = zoneId;
    if (warehouseId) where.warehouseId = warehouseId;
    if (status) where.status = status;
    if (scheduledDate) where.scheduledDate = scheduledDate;

    const [schedules, total] = await scheduleRepo.findAndCount({
      where,
      relations: ['user', 'zone', 'warehouse', 'creator'],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { startDate: 'ASC' },
      select: {
        id: true,
        userId: true,
        zoneId: true,
        warehouseId: true,
        startDate: true,
        endDate: true,
        status: true,
        note: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        user: { id: true, username: true, fullName: true },
        zone: { id: true, name: true },
        warehouse: { id: true, name: true },
        title: true
      }
    });

    return {
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getScheduleById(id) {
    const scheduleRepo = getRepository('Schedule');
    const schedule = await scheduleRepo.findOne({
      where: { id },
      relations: ['user', 'zone', 'warehouse', 'creator'],
      select: {
        id: true,
        userId: true,
        zoneId: true,
        warehouseId: true,
        scheduledDate: true,
        startTime: true,
        endTime: true,
        status: true,
        note: true,
        createdBy: true,
        createdAt: true,
        updatedAt: true,
        user: { id: true, username: true, fullName: true, phone: true },
        zone: { id: true, name: true },
        warehouse: { id: true, name: true },
        creator: { id: true, username: true, fullName: true },
      }
    });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return schedule;
  }

  async updateSchedule(id, updates) {
    const scheduleRepo = getRepository('Schedule');
    const schedule = await scheduleRepo.findOne({ where: { id } });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    if (updates.startTime && updates.endTime) {
      if (!this.isValidTimeFormat(updates.startTime) || !this.isValidTimeFormat(updates.endTime)) {
        throw new Error('Invalid time format. Use HH:mm:ss format');
      }
      if (updates.startTime >= updates.endTime) {
        throw new Error('Start time must be before end time');
      }
    } else if (updates.startTime) {
      if (!this.isValidTimeFormat(updates.startTime)) {
        throw new Error('Invalid time format. Use HH:mm:ss format');
      }
      if (updates.startTime >= schedule.endTime) {
        throw new Error('Start time must be before end time');
      }
    } else if (updates.endTime) {
      if (!this.isValidTimeFormat(updates.endTime)) {
        throw new Error('Invalid time format. Use HH:mm:ss format');
      }
      if (schedule.startTime >= updates.endTime) {
        throw new Error('Start time must be before end time');
      }
    }

    if (updates.scheduledDate && !this.isValidDateFormat(updates.scheduledDate)) {
      throw new Error('Invalid date format. Use YYYY-MM-DD format');
    }

    if (updates.status) {
      const validStatuses = ['planned', 'ongoing', 'completed', 'cancelled'];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
      }
    }

    if (updates.userId) {
      const userRepo = getRepository('User');
      const user = await userRepo.findOne({ where: { id: updates.userId } });
      if (!user) {
        throw new Error('User not found');
      }
    }

    if (updates.zoneId) {
      const zoneRepo = getRepository('Zone');
      const zone = await zoneRepo.findOne({ where: { id: updates.zoneId } });
      if (!zone) {
        throw new Error('Zone not found');
      }
    }

    if (updates.warehouseId) {
      const warehouseRepo = getRepository('Warehouse');
      const warehouse = await warehouseRepo.findOne({ where: { id: updates.warehouseId } });
      if (!warehouse) {
        throw new Error('Warehouse not found');
      }
    }

    Object.assign(schedule, updates);
    return await scheduleRepo.save(schedule);
  }

  async deleteSchedule(id) {
    const scheduleRepo = getRepository('Schedule');
    const schedule = await scheduleRepo.findOne({ where: { id } });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    return await scheduleRepo.remove(schedule);
  }

  async getSchedulesByUser(userId, query = {}) {
    const { page = 1, limit = 10, status, fromDate, toDate } = query;
    const scheduleRepo = getRepository('Schedule');

    const where = { userId };
    if (status) where.status = status;

    const queryBuilder = scheduleRepo.createQueryBuilder('schedule')
      .where('schedule.userId = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('schedule.status = :status', { status });
    }

    if (fromDate) {
      queryBuilder.andWhere('schedule.scheduledDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('schedule.scheduledDate <= :toDate', { toDate });
    }

    queryBuilder.leftJoinAndSelect('schedule.user', 'user')
      .leftJoinAndSelect('schedule.zone', 'zone')
      .leftJoinAndSelect('schedule.warehouse', 'warehouse')
      .leftJoinAndSelect('schedule.creator', 'creator')
      .orderBy('schedule.scheduledDate', 'DESC')
      .addOrderBy('schedule.startTime', 'ASC')
      .take(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const [schedules, total] = await queryBuilder.getManyAndCount();

    return {
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getSchedulesByZone(zoneId, query = {}) {
    const { page = 1, limit = 10, status, fromDate, toDate } = query;
    const scheduleRepo = getRepository('Schedule');

    const queryBuilder = scheduleRepo.createQueryBuilder('schedule')
      .where('schedule.zoneId = :zoneId', { zoneId });

    if (status) {
      queryBuilder.andWhere('schedule.status = :status', { status });
    }

    if (fromDate) {
      queryBuilder.andWhere('schedule.scheduledDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      queryBuilder.andWhere('schedule.scheduledDate <= :toDate', { toDate });
    }

    queryBuilder.leftJoinAndSelect('schedule.user', 'user')
      .leftJoinAndSelect('schedule.zone', 'zone')
      .leftJoinAndSelect('schedule.warehouse', 'warehouse')
      .leftJoinAndSelect('schedule.creator', 'creator')
      .orderBy('schedule.scheduledDate', 'DESC')
      .addOrderBy('schedule.startTime', 'ASC')
      .take(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const [schedules, total] = await queryBuilder.getManyAndCount();

    return {
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getSchedulesByDate(scheduledDate, query = {}) {
    const { page = 1, limit = 10, userId, zoneId, status } = query;
    const scheduleRepo = getRepository('Schedule');

    const where = { scheduledDate };
    if (userId) where.userId = userId;
    if (zoneId) where.zoneId = zoneId;
    if (status) where.status = status;

    const [schedules, total] = await scheduleRepo.findAndCount({
      where,
      relations: ['user', 'zone', 'warehouse', 'creator'],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { startTime: 'ASC' },
    });

    return {
      schedules,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async changeScheduleStatus(id, status) {
    const validStatuses = ['planned', 'ongoing', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const scheduleRepo = getRepository('Schedule');
    const schedule = await scheduleRepo.findOne({ where: { id } });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    schedule.status = status;
    return await scheduleRepo.save(schedule);
  }

  async assignScheduleToWarehouse(scheduleId, warehouseId) {
    const scheduleRepo = getRepository('Schedule');
    const schedule = await scheduleRepo.findOne({ where: { id: scheduleId } });

    if (!schedule) {
      throw new Error('Schedule not found');
    }

    const warehouseRepo = getRepository('Warehouse');
    const warehouse = await warehouseRepo.findOne({ where: { id: warehouseId } });

    if (!warehouse) {
      throw new Error('Warehouse not found');
    }

    schedule.warehouseId = warehouseId;
    return await scheduleRepo.save(schedule);
  }

  async getStatistics(query = {}) {
    const { fromDate, toDate, zoneId } = query;
    const scheduleRepo = getRepository('Schedule');

    const queryBuilder = scheduleRepo.createQueryBuilder('schedule');

    if (fromDate) {
      queryBuilder.where('schedule.scheduledDate >= :fromDate', { fromDate });
    }

    if (toDate) {
      if (fromDate) {
        queryBuilder.andWhere('schedule.scheduledDate <= :toDate', { toDate });
      } else {
        queryBuilder.where('schedule.scheduledDate <= :toDate', { toDate });
      }
    }

    if (zoneId) {
      if (fromDate || toDate) {
        queryBuilder.andWhere('schedule.zoneId = :zoneId', { zoneId });
      } else {
        queryBuilder.where('schedule.zoneId = :zoneId', { zoneId });
      }
    }

    const [total] = await queryBuilder.getManyAndCount();

    const statusCounts = await scheduleRepo
      .createQueryBuilder('schedule')
      .select('schedule.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('schedule.status')
      .getRawMany();

    return {
      total,
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item.status] = parseInt(item.count);
        return acc;
      }, {})
    };
  }

  isValidTimeFormat(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  isValidDateFormat(date) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj);
  }
}

module.exports = new ScheduleService();
