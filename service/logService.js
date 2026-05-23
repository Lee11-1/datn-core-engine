const { getRepository } = require('typeorm');
const ActivityLog = require('../models/ActivityLog');
const { AppDataSource } = require('../config/database');

class LogService {

  static async createLog(logData) {
    try {
      console.log(AppDataSource.isInitialized);
       const repository = AppDataSource.getRepository('ActivityLog');

      const log = repository.create(logData);
      const result = await repository.save(log);
      
      return result;
    } catch (error) {
      console.error('Error creating log in database:', error);
      throw error;
    }
  }

  static async getLogs(filters = {}, options = {}) {
    try {
      const repository = getRepository('ActivityLog');
      const { limit = 50, offset = 0, order = { createdAt: 'DESC' } } = options;

      let query = repository.createQueryBuilder('log');

      // Apply filters
      if (filters.userId) {
        query = query.andWhere('log.userId = :userId', { userId: filters.userId });
      }
      if (filters.action) {
        query = query.andWhere('log.action = :action', { action: filters.action });
      }
      if (filters.entityType) {
        query = query.andWhere('log.entityType = :entityType', { entityType: filters.entityType });
      }
      if (filters.entityId) {
        query = query.andWhere('log.entityId = :entityId', { entityId: filters.entityId });
      }
      if (filters.level) {
        query = query.andWhere('log.level = :level', { level: filters.level });
      }

      // Apply ordering
      Object.keys(order).forEach(key => {
        query = query.orderBy(`log.${key}`, order[key]);
      });

      // Apply pagination
      query = query.skip(offset).take(limit);

      const [data, total] = await query.getManyAndCount();

      return {
        data,
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error retrieving logs:', error);
      throw error;
    }
  }

  /**
   * Get log by ID
   */
  static async getLogById(id) {
    try {
      const repository = getRepository('ActivityLog');
      const log = await repository.findOne(id, {
        relations: ['user']
      });
      return log;
    } catch (error) {
      console.error('Error retrieving log by ID:', error);
      throw error;
    }
  }

  /**
   * Get logs by user ID
   */
  static async getLogsByUserId(userId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      return this.getLogs(
        { userId },
        { limit, offset, order: { createdAt: 'DESC' } }
      );
    } catch (error) {
      console.error('Error retrieving user logs:', error);
      throw error;
    }
  }

  /**
   * Get logs by entity type and ID
   */
  static async getLogsByEntity(entityType, entityId, options = {}) {
    try {
      const { limit = 50, offset = 0 } = options;
      return this.getLogs(
        { entityType, entityId },
        { limit, offset, order: { createdAt: 'DESC' } }
      );
    } catch (error) {
      console.error('Error retrieving entity logs:', error);
      throw error;
    }
  }

  /**
   * Delete old logs (older than specified days)
   */
  static async deleteOldLogs(daysOld = 90) {
    try {
      const repository = getRepository('ActivityLog');
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await repository
        .createQueryBuilder()
        .delete()
        .where('created_at < :cutoffDate', { cutoffDate })
        .execute();

      return result;
    } catch (error) {
      console.error('Error deleting old logs:', error);
      throw error;
    }
  }
}

module.exports = LogService;
