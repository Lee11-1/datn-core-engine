const { getRepository } = require('../config/typeorm');

class SellingSessionService {
  async createSellingSession(sessionData) {
    const { scheduleId, userId, customerId, checkinPhotoUrl, checkinLocation, checkinInZone, checkinIp } = sessionData;

    if (!scheduleId || !userId || !customerId || !checkinPhotoUrl) {
      throw new Error('Missing required fields: scheduleId, userId, customerId, checkinPhotoUrl');
    }

    const sessionRepo = getRepository('SellingSession');
    const scheduleRepo = getRepository('Schedule');
    const userRepo = getRepository('User');
    const customerRepo = getRepository('Customer');

    // Validate schedule exists
    const schedule = await scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) {
      throw new Error('Schedule not found');
    }

    // Validate user exists
    const user = await userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    // Validate customer exists
    const customer = await customerRepo.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Create location point from coordinates
    let location = null;
    if (checkinLocation && checkinLocation.coordinates) {
      location = {
        type: 'Point',
        coordinates: checkinLocation.coordinates,
      };
    }

    const session = sessionRepo.create({
      scheduleId,
      userId,
      customerId,
      checkinAt: new Date(),
      checkinPhotoUrl,
      checkinLocation: location,
      checkinInZone: checkinInZone !== undefined ? checkinInZone : true,
      checkinIp: checkinIp || null,
      status: 'active',
    });

    const savedSession = await sessionRepo.save(session);

    // Reload with relations
    const sessionWithRelations = await sessionRepo.findOne({
      where: { id: savedSession.id },
      relations: ['schedule', 'user', 'customer'],
    });

    return sessionWithRelations;
  }

  async getSellingSessionsBySchedule(scheduleId, query = {}) {
    const { page = 1, limit = 10 } = query;
    const sessionRepo = getRepository('SellingSession');

    const [sessions, total] = await sessionRepo.findAndCount({
      where: { scheduleId },
      relations: ['schedule', 'user', 'customer'],
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { checkinAt: 'DESC' },
    });

    return {
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    };
  }

  async getSellingSessionsByCustomer(customerId) {
    const sessionRepo = getRepository('SellingSession');

    const sessions = await sessionRepo.find({
      where: { customerId },
      relations: ['schedule', 'user', 'customer'],
      order: { checkinAt: 'DESC' },
    });

    return sessions;
  }

  async getSellingSessionDetail(sessionId) {
    const sessionRepo = getRepository('SellingSession');

    const session = await sessionRepo.findOne({
      where: { id: sessionId },
      relations: ['schedule', 'user', 'customer'],
    });

    if (!session) {
      throw new Error('Selling session not found');
    }

    return session;
  }

  async checkoutSellingSession(sessionId, data = {}) {
    const { checkoutPhotoUrl, checkoutLocation, note } = data;

    const sessionRepo = getRepository('SellingSession');
    const session = await sessionRepo.findOne({ where: { id: sessionId } });

    if (!session) {
      throw new Error('Selling session not found');
    }

    if (session.status === 'checked_out') {
      throw new Error('Session is already checked out');
    }

    session.status = 'checked_out';
    session.checkoutAt = new Date();

    if (checkoutPhotoUrl) {
      session.checkoutPhotoUrl = checkoutPhotoUrl;
    }

    if (checkoutLocation && checkoutLocation.coordinates) {
      session.checkoutLocation = {
        type: 'Point',
        coordinates: checkoutLocation.coordinates,
      };
    }

    if (note) {
      session.note = note;
    }

    const updatedSession = await sessionRepo.save(session);

    // Reload with relations
    const sessionWithRelations = await sessionRepo.findOne({
      where: { id: updatedSession.id },
      relations: ['schedule', 'user', 'customer'],
    });

    return sessionWithRelations;
  }

  async cancelSellingSession(sessionId, note = null) {
    const sessionRepo = getRepository('SellingSession');
    const session = await sessionRepo.findOne({ where: { id: sessionId } });

    if (!session) {
      throw new Error('Selling session not found');
    }

    session.status = 'cancelled';
    session.note = note || 'Cancelled by system';

    const updatedSession = await sessionRepo.save(session);

    return updatedSession;
  }
}

module.exports = new SellingSessionService();
