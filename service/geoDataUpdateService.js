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

   let queryBuilder = geoUpdateRepo
      .createQueryBuilder('update')
      .leftJoin('update.triggeredByUser', 'user')
      .select([
        'update',
        'user.id',
        'user.username',
        'user.fullName',
        'user.email',
        'user.phone',
        'user.role'
      ]);

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


}

module.exports = new GeoDataUpdateService();
