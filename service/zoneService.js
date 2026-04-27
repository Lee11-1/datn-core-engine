const { getRepository } = require('../config/typeorm');

class ZoneService {
  async createZone(zoneData) {
    const { name, nameEn, code, level, boundary, areaKm2, parentId, source, sourceVersion, customNote } = zoneData;

    if (!name || !level) {
      throw new Error('Missing required fields: name, level');
    }

    if (!['province', 'district', 'ward', 'custom'].includes(level)) {
      throw new Error('Invalid level. Must be one of: province, district, ward, custom');
    }

    const zoneRepo = getRepository('Zone');

    if (code) {
      const existingCode = await zoneRepo.createQueryBuilder('zone')
        .select('zone.id')
        .where('zone.code = :code', { code })
        .getOne();

      if (existingCode) {
        throw new Error('Zone code already exists');
      }
    }

    if (parentId) {
      const parentZone = await zoneRepo.createQueryBuilder('zone')
        .select('zone.id')
        .where('zone.id = :id', { id: parentId })
        .getOne();
      if (!parentZone) {
        throw new Error('Parent zone not found');
      }
    }

    const newZone = zoneRepo.create({
      name,
      nameEn: nameEn || null,
      code: code || null,
      level,
      boundary: boundary || null,
      areaKm2: areaKm2 || null,
      parentId: parentId || null,
      source: source || 'gadm',
      sourceVersion: sourceVersion || null,
      customNote: customNote || null,
      isActive: true,
    });

    return await zoneRepo.save(newZone);
  }

  async getZones(query) {
    const {search_text, page = 1, limit = 10, level, parentId, isActive = 'true', source, includeGeometry = 'false' } = query;
    const zoneRepo = getRepository('Zone');
    const includeGeomData = includeGeometry === 'true';

    let queryBuilder = zoneRepo.createQueryBuilder('zone')
      .leftJoinAndSelect('zone.parent', 'parent')
      .leftJoinAndSelect('zone.children', 'children');

    // Exclude geometry columns by default for faster queries
    if (!includeGeomData) {
      queryBuilder = queryBuilder.select([
        'zone.id',
        'zone.name',
        'zone.nameEn',
        'zone.code',
        'zone.level',
        'zone.areaKm2',
        'zone.parentId',
        'zone.source',
        'zone.sourceVersion',
        'zone.isActive',
        'zone.customNote',
        'zone.createdAt',
        'zone.updatedAt',
        'parent.id',
        'parent.name',
        'parent.code',
        'children.id',
        'children.name',
        'children.code',
      ]);
    }

    if (isActive !== 'all') {
      queryBuilder = queryBuilder.where('zone.isActive = :isActive', {
        isActive: isActive === 'true' ? true : false
      });
    }

    if (level) {
      queryBuilder = queryBuilder.andWhere('zone.level = :level', { level });
    }

    if (parentId) {
      queryBuilder = queryBuilder.andWhere('zone.parentId = :parentId', { parentId });
    }

    if (source) {
      queryBuilder = queryBuilder.andWhere('zone.source = :source', { source });
    }

    if (search_text) {
      queryBuilder = queryBuilder.andWhere(
        '(zone.name ILIKE :search_text OR zone.nameEn ILIKE :search_text OR zone.code ILIKE :search_text)',
        { search_text: `%${search_text}%` }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [zones, total] = await queryBuilder
      .orderBy('zone.level', 'ASC')
      .addOrderBy('zone.name', 'ASC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      zones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getZoneById(id, includeGeometry = true, loadRelations = false) {
    const zoneRepo = getRepository('Zone');
    let queryBuilder = zoneRepo.createQueryBuilder('zone')
      .where('zone.id = :id', { id });

    if (loadRelations) {
      queryBuilder = queryBuilder
        .leftJoinAndSelect('zone.parent', 'parent')
        .leftJoinAndSelect('zone.children', 'children');
    }

    if (!includeGeometry) {
      queryBuilder = queryBuilder.select([
        'zone.id',
        'zone.name',
        'zone.nameEn',
        'zone.code',
        'zone.level',
        'zone.areaKm2',
        'zone.parentId',
        'zone.source',
        'zone.sourceVersion',
        'zone.isActive',
        'zone.customNote',
        'zone.createdAt',
        'zone.updatedAt',
      ]);
    }

    const zone = await queryBuilder.getOne();

    if (!zone) {
      throw new Error('Zone not found');
    }

    return zone;
  }

  async getZoneByCode(code, includeGeometry = true, loadRelations = false) {
    const zoneRepo = getRepository('Zone');
    let queryBuilder = zoneRepo.createQueryBuilder('zone')
      .where('zone.code = :code', { code });

    if (loadRelations) {
      queryBuilder = queryBuilder
        .leftJoinAndSelect('zone.parent', 'parent')
        .leftJoinAndSelect('zone.children', 'children');
    }

    if (!includeGeometry) {
      queryBuilder = queryBuilder.select([
        'zone.id',
        'zone.name',
        'zone.nameEn',
        'zone.code',
        'zone.level',
        'zone.areaKm2',
        'zone.parentId',
        'zone.source',
        'zone.sourceVersion',
        'zone.isActive',
        'zone.customNote',
        'zone.createdAt',
        'zone.updatedAt',
      ]);
    }

    const zone = await queryBuilder.getOne();

    if (!zone) {
      throw new Error('Zone not found');
    }

    return zone;
  }

  async updateZone(id, updateData) {
    const { name, nameEn, code, level, boundary, areaKm2, parentId, source, sourceVersion, customNote, isActive } = updateData;

    const zoneRepo = getRepository('Zone');
    const zone = await zoneRepo.createQueryBuilder('zone')
      .select(['zone.id', 'zone.code', 'zone.parentId', 'zone.name', 'zone.level', 'zone.isActive'])
      .where('zone.id = :id', { id })
      .getOne();

    if (!zone) {
      throw new Error('Zone not found');
    }

    if (code && code !== zone.code) {
      const existingCode = await zoneRepo.createQueryBuilder('zone')
        .select('zone.id')
        .where('zone.code = :code', { code })
        .getOne();
      if (existingCode) {
        throw new Error('Zone code already exists');
      }
    }

    if (level && !['province', 'district', 'ward', 'custom'].includes(level)) {
      throw new Error('Invalid level. Must be one of: province, district, ward, custom');
    }

    // Validate parent zone if being changed
    if (parentId && parentId !== zone.id) {
      if (parentId !== zone.parentId) {
        const parentZone = await zoneRepo.createQueryBuilder('zone')
          .select('zone.id')
          .where('zone.id = :id', { id: parentId })
          .getOne();
        if (!parentZone) {
          throw new Error('Parent zone not found');
        }
      }
    }

    // Prevent zone from being its own parent
    if (parentId === id) {
      throw new Error('Cannot set zone as its own parent');
    }

    if (name) zone.name = name;
    if (nameEn !== undefined) zone.nameEn = nameEn;
    if (code !== undefined) zone.code = code;
    if (level) zone.level = level;
    if (boundary !== undefined) zone.boundary = boundary;
    if (areaKm2 !== undefined) zone.areaKm2 = areaKm2;
    if (parentId !== undefined) zone.parentId = parentId || null;
    if (source) zone.source = source;
    if (sourceVersion !== undefined) zone.sourceVersion = sourceVersion;
    if (customNote !== undefined) zone.customNote = customNote;
    if (isActive !== undefined) zone.isActive = isActive;

    return await zoneRepo.save(zone);
  }

  async deleteZone(id) {
    const zoneRepo = getRepository('Zone');
    
    // First check if zone exists and has children (lightweight query)
    const zone = await zoneRepo.createQueryBuilder('zone')
      .select('zone.id')
      .leftJoinAndSelect('zone.children', 'children', 'children.id IS NOT NULL')
      .where('zone.id = :id', { id })
      .getOne();

    if (!zone) {
      throw new Error('Zone not found');
    }

    // Check if zone has children
    if (zone.children && zone.children.length > 0) {
      throw new Error('Cannot delete zone with child zones. Please reassign or delete child zones first.');
    }

    // Fetch full zone for deletion
    const fullZone = await zoneRepo.findOne({
      where: { id }
    });

    return await zoneRepo.remove(fullZone);
  }

  async getZoneTree(query) {
    const { level, isActive = 'true', includeGeometry = 'false' } = query;
    const zoneRepo = getRepository('Zone');
    const includeGeomData = includeGeometry === 'true';

    let queryBuilder = zoneRepo.createQueryBuilder('zone')
      .leftJoinAndSelect('zone.parent', 'parent')
      .leftJoinAndSelect('zone.children', 'children');

    // Exclude geometry columns by default for faster queries
    if (!includeGeomData) {
      queryBuilder = queryBuilder.select([
        'zone.id',
        'zone.name',
        'zone.nameEn',
        'zone.code',
        'zone.level',
        'zone.areaKm2',
        'zone.parentId',
        'zone.source',
        'zone.sourceVersion',
        'zone.isActive',
        'zone.customNote',
        'zone.createdAt',
        'zone.updatedAt',
        'parent.id',
        'parent.name',
        'parent.code',
        'children.id',
        'children.name',
        'children.code',
      ]);
    }

    if (isActive !== 'all') {
      queryBuilder = queryBuilder.where('zone.isActive = :isActive', {
        isActive: isActive === 'true' ? true : false
      });
    }

    if (level) {
      queryBuilder = queryBuilder.andWhere('zone.level = :level', { level });
    }

    queryBuilder = queryBuilder.orderBy('zone.name', 'ASC');
    const zones = await queryBuilder.getMany();

    const map = {};
    const tree = [];

    zones.forEach(zone => {
      map[zone.id] = { ...zone, children: [] };
    });

    zones.forEach(zone => {
      if (zone.parentId && map[zone.parentId]) {
        map[zone.parentId].children.push(map[zone.id]);
      } else {
        tree.push(map[zone.id]);
      }
    });

    return tree;
  }

  async getZonesByLevel(level, query) {
    const { page = 1, limit = 10, search, parentId, isActive = 'true', includeGeometry = 'false' } = query;
    const zoneRepo = getRepository('Zone');
    const includeGeomData = includeGeometry === 'true';

    if (!['province', 'district', 'ward', 'custom'].includes(level)) {
      throw new Error('Invalid level. Must be one of: province, district, ward, custom');
    }

    let queryBuilder = zoneRepo.createQueryBuilder('zone')
      .where('zone.level = :level', { level })
      .leftJoinAndSelect('zone.parent', 'parent')
      .leftJoinAndSelect('zone.children', 'children');

    // Exclude geometry columns by default for faster queries
    if (!includeGeomData) {
      queryBuilder = queryBuilder.select([
        'zone.id',
        'zone.name',
        'zone.nameEn',
        'zone.code',
        'zone.level',
        'zone.areaKm2',
        'zone.parentId',
        'zone.source',
        'zone.sourceVersion',
        'zone.isActive',
        'zone.customNote',
        'zone.createdAt',
        'zone.updatedAt',
        'parent.id',
        'parent.name',
        'parent.code',
        'children.id',
        'children.name',
        'children.code',
      ]);
    }

    if (isActive !== 'all') {
      queryBuilder = queryBuilder.andWhere('zone.isActive = :isActive', {
        isActive: isActive === 'true' ? true : false
      });
    }

    if (parentId) {
      queryBuilder = queryBuilder.andWhere('zone.parentId = :parentId', { parentId });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(zone.name ILIKE :search OR zone.nameEn ILIKE :search OR zone.code ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [zones, total] = await queryBuilder
      .orderBy('zone.name', 'ASC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      zones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChildZones(parentId, query) {
    const { page = 1, limit = 10, isActive = 'true', includeGeometry = 'false' } = query;
    const zoneRepo = getRepository('Zone');
    const includeGeomData = includeGeometry === 'true';

    const parentZone = await zoneRepo.createQueryBuilder('zone')
      .select('zone.id')
      .where('zone.id = :id', { id: parentId })
      .getOne();

    if (!parentZone) {
      throw new Error('Parent zone not found');
    }

    let queryBuilder = zoneRepo.createQueryBuilder('zone')
      .where('zone.parentId = :parentId', { parentId })
      .leftJoinAndSelect('zone.children', 'children');

    // Exclude geometry columns by default for faster queries
    if (!includeGeomData) {
      queryBuilder = queryBuilder.select([
        'zone.id',
        'zone.name',
        'zone.nameEn',
        'zone.code',
        'zone.level',
        'zone.areaKm2',
        'zone.parentId',
        'zone.source',
        'zone.sourceVersion',
        'zone.isActive',
        'zone.customNote',
        'zone.createdAt',
        'zone.updatedAt',
        'children.id',
        'children.name',
        'children.code',
      ]);
    }

    if (isActive !== 'all') {
      queryBuilder = queryBuilder.andWhere('zone.isActive = :isActive', {
        isActive: isActive === 'true' ? true : false
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [zones, total] = await queryBuilder
      .orderBy('zone.name', 'ASC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      zones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async activateZone(id) {
    const zoneRepo = getRepository('Zone');
    const zone = await zoneRepo.findOne({
      where: { id }
    });

    if (!zone) {
      throw new Error('Zone not found');
    }

    zone.isActive = true;
    return await zoneRepo.save(zone);
  }

  async deactivateZone(id) {
    const zoneRepo = getRepository('Zone');
    const zone = await zoneRepo.findOne({
      where: { id }
    });

    if (!zone) {
      throw new Error('Zone not found');
    }

    zone.isActive = false;
    return await zoneRepo.save(zone);
  }

  async syncZones(syncData) {
    const { zones = [], updateRecordId, source = 'gadm', timestamp, userId } = syncData;

    if (!Array.isArray(zones) || zones.length === 0) {
      throw new Error('Invalid sync data: zones array is required and must not be empty');
    }

    if (!updateRecordId) {
      throw new Error('Invalid sync data: updateRecordId is required');
    }

    const zoneRepo = getRepository('Zone');
    let created = 0;
    let updated = 0;
    const errors = [];
    const createdZones = [];
    const updatedZones = [];

    try {
      const existingZonesMap = new Map();
      const existingZoneCodes = zones.map(z => z.code).filter(Boolean);
      
      if (existingZoneCodes.length > 0) {
        const existingZones = await zoneRepo.createQueryBuilder('zone')
          .select(['zone.id', 'zone.code', 'zone.name', 'zone.level', 'zone.parentId'])
          .where('zone.code IN (:...codes)', { codes: existingZoneCodes })
          .getMany();
        
        existingZones.forEach(z => existingZonesMap.set(z.code, z));
      }

      const parentCodes = zones
        .map(z => z.parentCode)
        .filter(Boolean);
      
      const parentZonesMap = new Map();
      if (parentCodes.length > 0) {
        const parentZones = await zoneRepo.createQueryBuilder('zone')
          .select(['zone.id', 'zone.code'])
          .where('zone.code IN (:...parentCodes)', { parentCodes })
          .getMany();
        
        parentZones.forEach(z => parentZonesMap.set(z.code, z));
      }

      for (const zoneData of zones) {
        try {
          const { code, name, nameEn, level, boundary, areaKm2, parentCode } = zoneData;

          if (!code || !name || !level) {
            errors.push(`Invalid zone data: missing required fields (code: ${code}, name: ${name}, level: ${level})`);
            continue;
          }

          const existingZone = existingZonesMap.get(code);
          let parentId = null;
          
          if (parentCode && parentZonesMap.has(parentCode)) {
            parentId = parentZonesMap.get(parentCode).id;
          }

          if (existingZone) {
            existingZone.name = name;
            if (nameEn) existingZone.nameEn = nameEn;
            if (level) existingZone.level = level;
            if (boundary) existingZone.boundary = boundary;
            if (areaKm2 !== undefined) existingZone.areaKm2 = areaKm2;
            if (parentId !== null) existingZone.parentId = parentId;
            existingZone.source = 'gadm';
            existingZone.sourceVersion = timestamp || new Date().toISOString();

            await zoneRepo.save(existingZone);
            updated++;
            updatedZones.push(existingZone);
          } else {
            const newZone = zoneRepo.create({
              name,
              nameEn: nameEn || null,
              code,
              level,
              boundary: boundary || null,
              areaKm2: areaKm2 || null,
              parentId: parentId || null,
              source: 'gadm',
              sourceVersion: timestamp || new Date().toISOString(),
              isActive: true,
            });

            await zoneRepo.save(newZone);
            created++;
            createdZones.push(newZone);
          }
        } catch (error) {
          errors.push(`Error processing zone ${zoneData?.code}: ${error.message}`);
        }
      }

      return {
        message: `Synced ${created + updated} zones - ${created} created, ${updated} updated`,
        summary: {
          totalZones: zones.length,
          created,
          updated,
          errors: errors.length,
        },
        updateRecordId,
        source,
        timestamp: timestamp || new Date(),
        processedBy: userId,
        errorDetails: errors.length > 0 ? errors : null,
        createdCount: created,
        updatedCount: updated,
      };
    } catch (error) {
      throw new Error(`Zone sync failed: ${error.message}`);
    }
  }
}

module.exports = new ZoneService();
