const { getRepository } = require('../config/typeorm');

class GeoDataUpdateService {
  async createGeoDataUpdate(updateData) {
    const { source, version, zonesAdded, zonesUpdated, zonesRemoved, status, errorDetail, triggeredBy } = updateData;

    if (!source || !version) {
      throw new Error('Missing required fields: source, version');
    }

    if (!['osm', 'gadm', 'manual'].includes(source)) {
      throw new Error('Invalid source. Must be one of: osm, gadm, manual');
    }

    const geoUpdateRepo = getRepository('GeoDataUpdate');

    if (triggeredBy) {
      const userRepo = getRepository('User');
      const user = await userRepo.findOne({
        where: { id: triggeredBy }
      });
      if (!user) {
        throw new Error('User not found');
      }
    }

    const newUpdate = geoUpdateRepo.create({
      source,
      version,
      zonesAdded: zonesAdded || 0,
      zonesUpdated: zonesUpdated || 0,
      zonesRemoved: zonesRemoved || 0,
      status: status || 'success',
      errorDetail: errorDetail || null,
      triggeredBy: triggeredBy || null,
    });

    return await geoUpdateRepo.save(newUpdate);
  }

  async getGeoDataUpdates(query) {
    const { page = 1, limit = 10, source, status = 'all', search } = query;
    const geoUpdateRepo = getRepository('GeoDataUpdate');

    let queryBuilder = geoUpdateRepo.createQueryBuilder('update')
      .leftJoinAndSelect('update.triggeredByUser', 'user');

    if (source) {
      queryBuilder = queryBuilder.where('update.source = :source', { source });
    }

    if (status !== 'all') {
      queryBuilder = queryBuilder.andWhere('update.status = :status', { status });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(update.version ILIKE :search OR update.errorDetail ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [updates, total] = await queryBuilder
      .orderBy('update.appliedAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      updates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGeoDataUpdateById(id) {
    const geoUpdateRepo = getRepository('GeoDataUpdate');
    const update = await geoUpdateRepo.findOne({
      where: { id },
      relations: ['triggeredByUser'],
    });

    if (!update) {
      throw new Error('GeoDataUpdate not found');
    }

    return update;
  }

  async updateGeoDataUpdate(id, updateData) {
    const { source, version, zonesAdded, zonesUpdated, zonesRemoved, status, errorDetail, triggeredBy } = updateData;

    const geoUpdateRepo = getRepository('GeoDataUpdate');
    const update = await geoUpdateRepo.findOne({
      where: { id }
    });

    if (!update) {
      throw new Error('GeoDataUpdate not found');
    }

    // Validate source
    if (source && !['osm', 'gadm', 'manual'].includes(source)) {
      throw new Error('Invalid source. Must be one of: osm, gadm, manual');
    }

    // Validate triggeredBy user if being changed
    if (triggeredBy && triggeredBy !== update.triggeredBy) {
      const userRepo = getRepository('User');
      const user = await userRepo.findOne({
        where: { id: triggeredBy }
      });
      if (!user) {
        throw new Error('User not found');
      }
    }

    if (source) update.source = source;
    if (version) update.version = version;
    if (zonesAdded !== undefined) update.zonesAdded = zonesAdded;
    if (zonesUpdated !== undefined) update.zonesUpdated = zonesUpdated;
    if (zonesRemoved !== undefined) update.zonesRemoved = zonesRemoved;
    if (status) update.status = status;
    if (errorDetail !== undefined) update.errorDetail = errorDetail;
    if (triggeredBy !== undefined) update.triggeredBy = triggeredBy || null;

    return await geoUpdateRepo.save(update);
  }

  async deleteGeoDataUpdate(id) {
    const geoUpdateRepo = getRepository('GeoDataUpdate');
    const update = await geoUpdateRepo.findOne({
      where: { id }
    });

    if (!update) {
      throw new Error('GeoDataUpdate not found');
    }

    return await geoUpdateRepo.remove(update);
  }

  async getGeoDataUpdatesBySource(source, query) {
    const { page = 1, limit = 10, status = 'all' } = query;
    const geoUpdateRepo = getRepository('GeoDataUpdate');

    if (!['osm', 'gadm', 'manual'].includes(source)) {
      throw new Error('Invalid source. Must be one of: osm, gadm, manual');
    }

    let queryBuilder = geoUpdateRepo.createQueryBuilder('update')
      .where('update.source = :source', { source })
      .leftJoinAndSelect('update.triggeredByUser', 'user');

    if (status !== 'all') {
      queryBuilder = queryBuilder.andWhere('update.status = :status', { status });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [updates, total] = await queryBuilder
      .orderBy('update.appliedAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      updates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGeoDataUpdatesByStatus(status, query) {
    const { page = 1, limit = 10, source } = query;
    const geoUpdateRepo = getRepository('GeoDataUpdate');

    let queryBuilder = geoUpdateRepo.createQueryBuilder('update')
      .where('update.status = :status', { status })
      .leftJoinAndSelect('update.triggeredByUser', 'user');

    if (source) {
      queryBuilder = queryBuilder.andWhere('update.source = :source', { source });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [updates, total] = await queryBuilder
      .orderBy('update.appliedAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      updates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLatestGeoDataUpdate(source) {
    const geoUpdateRepo = getRepository('GeoDataUpdate');

    if (source && !['osm', 'gadm', 'manual'].includes(source)) {
      throw new Error('Invalid source. Must be one of: osm, gadm, manual');
    }

    let queryBuilder = geoUpdateRepo.createQueryBuilder('update')
      .leftJoinAndSelect('update.triggeredByUser', 'user');

    if (source) {
      queryBuilder = queryBuilder.where('update.source = :source', { source });
    }

    const update = await queryBuilder
      .orderBy('update.appliedAt', 'DESC')
      .limit(1)
      .getOne();

    if (!update) {
      throw new Error('No GeoDataUpdate found');
    }

    return update;
  }

  async getGeoDataUpdateStatistics(source) {
    const geoUpdateRepo = getRepository('GeoDataUpdate');

    let queryBuilder = geoUpdateRepo.createQueryBuilder('update');

    if (source) {
      if (!['osm', 'gadm', 'manual'].includes(source)) {
        throw new Error('Invalid source. Must be one of: osm, gadm, manual');
      }
      queryBuilder = queryBuilder.where('update.source = :source', { source });
    }

    const updates = await queryBuilder.getMany();

    const stats = {
      total: updates.length,
      totalZonesAdded: updates.reduce((sum, u) => sum + u.zonesAdded, 0),
      totalZonesUpdated: updates.reduce((sum, u) => sum + u.zonesUpdated, 0),
      totalZonesRemoved: updates.reduce((sum, u) => sum + u.zonesRemoved, 0),
      successCount: updates.filter(u => u.status === 'success').length,
      failureCount: updates.filter(u => u.status === 'failed').length,
    };

    return stats;
  }

  async getGeoDataUpdatesByUser(userId, query) {
    const { page = 1, limit = 10, status = 'all' } = query;
    const geoUpdateRepo = getRepository('GeoDataUpdate');

    // Validate user exists
    const userRepo = getRepository('User');
    const user = await userRepo.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    let queryBuilder = geoUpdateRepo.createQueryBuilder('update')
      .where('update.triggeredBy = :userId', { userId })
      .leftJoinAndSelect('update.triggeredByUser', 'user');

    if (status !== 'all') {
      queryBuilder = queryBuilder.andWhere('update.status = :status', { status });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [updates, total] = await queryBuilder
      .orderBy('update.appliedAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      updates,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

module.exports = new GeoDataUpdateService();
