const { getRepository } = require('../config/typeorm');
const bcrypt = require('bcryptjs');

class UserService {
  async createUser(userData) {
    const { username, email, password, fullName, phone, role } = userData;

    if (!username || !email || !password || !fullName) {
      throw new Error('Missing required fields: username, email, password, fullName');
    }

    const userRepo = getRepository('User');
    const existingUser = await userRepo.findOne({
      where: [{ username }, { email }]
    });

    if (existingUser) {
      throw new Error('Username or email already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({
      username,
      email,
      passwordHash,
      fullName,
      phone: phone || null,
      role: role || 'sale',
      status: 'active',
    });

    return await userRepo.save(newUser);
  }

  async getUsers(query) {
    const { page = 1, limit = 10, role, status } = query;
    const userRepo = getRepository('User');
    
    const where = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await userRepo.findAndCount({
      where,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      order: { createdAt: 'DESC' },
      select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'status', 'createdAt', 'updatedAt']
    });

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  async getUserById(id) {
    const userRepo = getRepository('User');
    const user = await userRepo.findOne({
      where: { id },
      relations: ['manager'],
      select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'status', 'createdAt', 'updatedAt', 'managerId']
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async updateUser(id, updates) {
    const userRepo = getRepository('User');
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    delete updates.passwordHash;
    delete updates.password;

    Object.assign(user, updates);
    return await userRepo.save(user);
  }

  async deleteUser(id) {
    const userRepo = getRepository('User');
    const user = await userRepo.findOne({ where: { id } });

    if (!user) {
      throw new Error('User not found');
    }

    await userRepo.delete({ id });
    return user;
  }
}

module.exports = new UserService();
