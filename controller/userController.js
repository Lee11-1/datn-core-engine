const { getRepository } = require('../config/typeorm');
const bcrypt = require('bcryptjs');

class UserController {
  /**
   * Create new user
   * POST /api/users
   */
  async createUser(ctx) {
    try {
      const { username, email, password, fullName, phone, role } = ctx.request.body;

      // Validate required fields
      if (!username || !email || !password || !fullName) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Missing required fields: username, email, password, fullName',
        };
        return;
      }

      const userRepo = getRepository('User');

      // Check if user already exists
      const existingUser = await userRepo.findOne({
        where: [
          { username },
          { email }
        ]
      });

      if (existingUser) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: 'Username or email already exists',
        };
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const newUser = userRepo.create({
        username,
        email,
        passwordHash,
        fullName,
        phone: phone || null,
        role: role || 'sale',
        status: 'active',
      });

      const savedUser = await userRepo.save(newUser);

      // Remove password from response
      const { passwordHash: _, ...userResponse } = savedUser;

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'User created successfully',
        data: userResponse,
      };

    } catch (error) {
      console.error('Error creating user:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  /**
   * Get all users
   * GET /api/users
   */
  async getUsers(ctx) {
    try {
      const userRepo = getRepository('User');
      
      const { page = 1, limit = 10, role, status } = ctx.query;
      
      const where = {};
      if (role) where.role = role;
      if (status) where.status = status;

      const [users, total] = await userRepo.findAndCount({
        where,
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        order: {
          createdAt: 'DESC'
        },
        select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'status', 'createdAt', 'updatedAt']
      });

      ctx.body = {
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit))
        }
      };

    } catch (error) {
      console.error('Error getting users:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  /**
   * Get user by ID
   * GET /api/users/:id
   */
  async getUserById(ctx) {
    try {
      const { id } = ctx.params;
      const userRepo = getRepository('User');

      const user = await userRepo.findOne({
        where: { id },
        relations: ['manager'],
        select: ['id', 'username', 'email', 'fullName', 'phone', 'role', 'status', 'createdAt', 'updatedAt', 'managerId']
      });

      if (!user) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: 'User not found',
        };
        return;
      }

      ctx.body = {
        success: true,
        data: user,
      };

    } catch (error) {
      console.error('Error getting user:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  /**
   * Update user
   * PUT /api/users/:id
   */
  async updateUser(ctx) {
    try {
      const { id } = ctx.params;
      const updates = ctx.request.body;
      const userRepo = getRepository('User');

      const user = await userRepo.findOne({ where: { id } });

      if (!user) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: 'User not found',
        };
        return;
      }

      // Don't allow password update through this endpoint
      delete updates.passwordHash;
      delete updates.password;

      // Update user
      Object.assign(user, updates);
      const updatedUser = await userRepo.save(user);

      // Remove password from response
      const { passwordHash: _, ...userResponse } = updatedUser;

      ctx.body = {
        success: true,
        message: 'User updated successfully',
        data: userResponse,
      };

    } catch (error) {
      console.error('Error updating user:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }

  /**
   * Delete user
   * DELETE /api/users/:id
   */
  async deleteUser(ctx) {
    try {
      const { id } = ctx.params;
      const userRepo = getRepository('User');

      const user = await userRepo.findOne({ where: { id } });

      if (!user) {
        ctx.status = 404;
        ctx.body = {
          success: false,
          message: 'User not found',
        };
        return;
      }

      await userRepo.delete({ id });

      ctx.body = {
        success: true,
        message: 'User deleted successfully',
      };

    } catch (error) {
      console.error('Error deleting user:', error);
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: 'Internal server error',
        error: error.message,
      };
    }
  }
}

module.exports = new UserController();
