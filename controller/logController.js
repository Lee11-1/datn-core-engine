const LogService = require('../service/logService');

class LogController {
  /**
   * Create activity log
   * POST /logs
   */
  static async createLog(ctx) {
    try {
      const payload = ctx.request.body;
      
      if (!payload.action) {
        ctx.status = 400;
        ctx.body = {
          code: 'INVALID_PAYLOAD',
          message: 'action is required'
        };
        return;
      }

      const logData = {
        userId: payload.userId || null,
        action: payload.action,
        entityType: payload.entityType || null,
        entityId: payload.entityId || null,
        level: payload.level || 'info',
        ipAddress: payload.ipAddress || ctx.ip,
        userAgent: payload.userAgent || ctx.headers['user-agent'] || null,
        metadata: payload.metadata || null,
      };

      const result = await LogService.createLog(logData);

      ctx.status = 201;
      ctx.body = {
        code: 'SUCCESS',
        message: 'Log created successfully',
        data: result
      };
    } catch (error) {
      console.error('Error creating log:', error);
      ctx.status = 500;
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: error.message
      };
    }
  }

  static async getLogs(ctx) {
    try {
      const { userId, action, entityType, level, limit = 50, offset = 0 } = ctx.query;
      
      const filters = {};
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (entityType) filters.entityType = entityType;
      if (level) filters.level = level;

      const result = await LogService.getLogs(filters, {
        limit: Math.min(parseInt(limit), 100),
        offset: parseInt(offset),
        order: { createdAt: 'DESC' }
      });

      ctx.status = 200;
      ctx.body = {
        code: 'SUCCESS',
        message: 'Logs retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Error retrieving logs:', error);
      ctx.status = 500;
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: error.message
      };
    }
  }

  /**
   * Get log by ID
   * GET /logs/:id
   */
  static async getLogById(ctx) {
    try {
      const { id } = ctx.params;
      
      const log = await LogService.getLogById(id);

      if (!log) {
        ctx.status = 404;
        ctx.body = {
          code: 'NOT_FOUND',
          message: 'Log not found'
        };
        return;
      }

      ctx.status = 200;
      ctx.body = {
        code: 'SUCCESS',
        message: 'Log retrieved successfully',
        data: log
      };
    } catch (error) {
      console.error('Error retrieving log:', error);
      ctx.status = 500;
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: error.message
      };
    }
  }

  /**
   * Get logs by entity
   * GET /logs/entity/:entityType/:entityId
   */
  static async getLogsByEntity(ctx) {
    try {
      const { entityType, entityId } = ctx.params;
      const { limit = 50, offset = 0 } = ctx.query;

      const result = await LogService.getLogs(
        { entityType, entityId },
        {
          limit: Math.min(parseInt(limit), 100),
          offset: parseInt(offset),
          order: { createdAt: 'DESC' }
        }
      );

      ctx.status = 200;
      ctx.body = {
        code: 'SUCCESS',
        message: 'Entity logs retrieved successfully',
        data: result
      };
    } catch (error) {
      console.error('Error retrieving entity logs:', error);
      ctx.status = 500;
      ctx.body = {
        code: 'INTERNAL_ERROR',
        message: error.message
      };
    }
  }
}

module.exports = LogController;
