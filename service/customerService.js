const { getRepository } = require('../config/typeorm');

class CustomerService {
  async createCustomer(customerData) {
    const { fullName, phone, email, address, location, zoneId, createdBy, note } = customerData;

    if (!fullName) {
      throw new Error('Missing required field: fullName');
    }

    const customerRepo = getRepository('Customer');
    
    if (phone) {
      const existingPhone = await customerRepo.findOne({
        where: { phone }
      });

      if (existingPhone) {
        throw new Error('Phone number already exists');
      }
    }

    const newCustomer = customerRepo.create({
      fullName,
      phone: phone || null,
      email: email || null,
      address: address || null,
      location: location || null,
      zoneId: zoneId || null,
      createdBy: createdBy || null,
      note: note || null,
    });

    return await customerRepo.save(newCustomer);
  }

  async getCustomers(query) {
    const { page = 1, limit = 10, zoneId, search } = query;
    const customerRepo = getRepository('Customer');

    let queryBuilder = customerRepo.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.zone', 'zone')

    if (zoneId) {
      queryBuilder = queryBuilder.where('customer.zoneId = :zoneId', { zoneId });
    }

    if (search) {
      queryBuilder = queryBuilder.andWhere(
        '(customer.fullName ILIKE :search OR customer.phone ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [customers, total] = await queryBuilder
      .orderBy('customer.createdAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCustomerById(id) {
    const customerRepo = getRepository('Customer');
    const customer = await customerRepo.findOne({
      where: { id },
      relations: ['zone', 'createdByUser'],
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return customer;
  }

  async updateCustomer(id, updateData) {
    const { fullName, phone, email, address, location, zoneId, note } = updateData;

    const customerRepo = getRepository('Customer');
    const customer = await customerRepo.findOne({
      where: { id }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    // Check if phone is unique (if being updated)
    if (phone && phone !== customer.phone) {
      const existingPhone = await customerRepo.findOne({
        where: { phone }
      });
      if (existingPhone) {
        throw new Error('Phone number already exists');
      }
    }

    // Update fields
    if (fullName) customer.fullName = fullName;
    if (phone !== undefined) customer.phone = phone || null;
    if (email !== undefined) customer.email = email || null;
    if (address !== undefined) customer.address = address || null;
    if (location !== undefined) customer.location = location || null;
    if (zoneId !== undefined) customer.zoneId = zoneId || null;
    if (note !== undefined) customer.note = note || null;

    return await customerRepo.save(customer);
  }

  async deleteCustomer(id) {
    const customerRepo = getRepository('Customer');
    const customer = await customerRepo.findOne({
      where: { id }
    });

    if (!customer) {
      throw new Error('Customer not found');
    }

    return await customerRepo.remove(customer);
  }

  async searchCustomers(keyword, limit = 20) {
    const customerRepo = getRepository('Customer');
    return await customerRepo
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.zone', 'zone')
      .leftJoinAndSelect('customer.createdByUser', 'createdByUser')
      .where(
        '(customer.fullName ILIKE :keyword OR customer.phone ILIKE :keyword OR customer.email ILIKE :keyword)',
        { keyword: `%${keyword}%` }
      )
      .orderBy('customer.fullName', 'ASC')
      .take(limit)
      .getMany();
  }

  async getCustomersByZone(query) {
    const { page = 1, limit = 10, zoneId } = query;

    const customerRepo = getRepository('Customer');
    const [customers, total] = await customerRepo.findAndCount({
      where: { zoneId },
      relations: ['zone', 'createdByUser'],
      take: limit,
      skip: (page - 1) * limit,
      order: { createdAt: 'DESC' },
    });

    return {
      customers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
     };
  }

  async getCustomersByUser(userId, limit = 50, offset = 0) {
    const customerRepo = getRepository('Customer');
    const [customers, total] = await customerRepo.findAndCount({
      where: { createdBy: userId },
      relations: ['zone', 'createdByUser'],
      take: limit,
      skip: offset,
      order: { createdAt: 'DESC' },
    });

    return { customers, total };
  }

  async getCustomerByPhone(phone) {
    const customerRepo = getRepository('Customer');
    return await customerRepo.findOne({
      where: { phone },
      relations: ['zone', 'createdByUser'],
    });
  }

  async getCustomerByEmail(email) {
    const customerRepo = getRepository('Customer');
    return await customerRepo.findOne({
      where: { email },
      relations: ['zone', 'createdByUser'],
    });
  }
}

module.exports = new CustomerService();
