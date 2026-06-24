const { getRepository } = require('../config/typeorm');

class ComplaintService {
  async createComplaint(complaintData) {
    const {
      orderId,
      customerId,
      userId,
      title,
      description,
      status,
      priority,
      complaintType,
      resolutionNote,
    } = complaintData;

    if (!orderId) throw new Error('Missing required field: orderId');
    if (!customerId) throw new Error('Missing required field: customerId');
    if (!userId) throw new Error('Missing required field: userId');
    if (!title) throw new Error('Missing required field: title');
    if (!complaintType) throw new Error('Missing required field: complaintType');

    const complaintRepo = getRepository('Complaint');

    const newComplaint = complaintRepo.create({
      orderId,
      customerId,
      userId,
      title,
      description:     description     || null,
      status:          status          || 'pending',
      priority:        priority        || 'normal',
      complaintType,
      resolutionNote:  resolutionNote  || null,
      resolvedAt:      null,
    });

    return await complaintRepo.save(newComplaint);
  }

  async getComplaints(query) {
    const {
      page   = 1,
      limit  = 10,
      status,
      priority,
      complaintType,
      search,
    } = query;

    const complaintRepo = getRepository('Complaint');

    let qb = complaintRepo
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.order',    'order')
      .leftJoinAndSelect('complaint.customer', 'customer')
      .leftJoin('complaint.user', 'user')
      .select([
        'complaint',
        'order',
        'customer',
        'user.id',
        'user.username',
        'user.fullName',
        'user.email',
        'user.phone',
        'user.role'
      ]);

    if (status) {
      qb = qb.andWhere('complaint.status = :status', { status });
    }

    if (priority) {
      qb = qb.andWhere('complaint.priority = :priority', { priority });
    }

    if (complaintType) {
      qb = qb.andWhere('complaint.complaintType = :complaintType', { complaintType });
    }

    if (search) {
      qb = qb.andWhere(
        '(complaint.title ILIKE :search OR complaint.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [complaints, total] = await qb
      .orderBy('complaint.createdAt', 'DESC')
      .skip(skip)
      .take(parseInt(limit))
      .getManyAndCount();

    return {
      complaints,
      pagination: {
        page:       parseInt(page),
        limit:      parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async updateComplaint(id, updateData) {
    const {
      title,
      description,
      status,
      priority,
      complaintType,
      resolutionNote,
      resolvedAt,
    } = updateData;

    const complaintRepo = getRepository('Complaint');
    const complaint = await complaintRepo.findOne({ where: { id } });

    if (!complaint) throw new Error('Complaint not found');

    if (title          !== undefined) complaint.title          = title;
    if (description    !== undefined) complaint.description    = description    || null;
    if (priority       !== undefined) complaint.priority       = priority;
    if (complaintType  !== undefined) complaint.complaintType  = complaintType;
    if (resolutionNote !== undefined) complaint.resolutionNote = resolutionNote || null;

    // Khi chuyển sang resolved → tự động ghi thời gian giải quyết
    if (status !== undefined) {
      complaint.status = status;
      if (status === 'resolved' && !complaint.resolvedAt) {
        complaint.resolvedAt = new Date();
      } else if (status !== 'resolved') {
        complaint.resolvedAt = null;
      }
    }

    if (resolvedAt !== undefined) complaint.resolvedAt = resolvedAt || null;

    return await complaintRepo.save(complaint);
  }

  async updateComplaintStatus(id, status) {
    const complaintRepo = getRepository('Complaint');
    const complaint = await complaintRepo.findOne({ where: { id } });
    if (!complaint) throw new Error('Complaint not found');

    complaint.status = status;  
    await complaintRepo.save(complaint);
    return
  }

  async deleteComplaint(id) {
    const complaintRepo = getRepository('Complaint');
    const complaint = await complaintRepo.findOne({ where: { id } });

    if (!complaint) throw new Error('Complaint not found');

    return await complaintRepo.remove(complaint);
  }

  async getComplaintsByUser(userId, query = {}) {
    const { page = 1, limit = 10, status } = query;

    const complaintRepo = getRepository('Complaint');

    const where = { userId };
    if (status) where.status = status;

    const [complaints, total] = await complaintRepo.findAndCount({
      where,
      relations: ['order', 'customer'],
      take:  parseInt(limit),
      skip:  (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
    });

    return {
      complaints,
      pagination: {
        page:       parseInt(page),
        limit:      parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getComplaintsByCustomer(customerId, query = {}) {
    const { page = 1, limit = 10, status } = query;

    const complaintRepo = getRepository('Complaint');

    const where = { customerId };
    if (status) where.status = status;

    const [complaints, total] = await complaintRepo.findAndCount({
      where,
      relations: ['order', 'user'],
      take:  parseInt(limit),
      skip:  (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
    });

    return {
      complaints,
      pagination: {
        page:       parseInt(page),
        limit:      parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getComplaintsByOrder(orderId, query = {}) {
    const { page = 1, limit = 10 } = query;

    const complaintRepo = getRepository('Complaint');

    const [complaints, total] = await complaintRepo.findAndCount({
      where:     { orderId },
      relations: ['customer', 'user'],
      take:  parseInt(limit),
      skip:  (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
    });

    return {
      complaints,
      pagination: {
        page:       parseInt(page),
        limit:      parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  }
}

module.exports = new ComplaintService();