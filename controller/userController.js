const userService = require('../service/userServices');

class UserController {
  async createUser(ctx) {
    try {
      const userData = ctx.request.body;
      const savedUser = await userService.createUser(userData);
      const { passwordHash: _, ...userResponse } = savedUser;

      ctx.status = 201;
      ctx.body = {
        success: true,
        message: 'User created successfully',
        data: userResponse,
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getUsers(ctx) {
    try {
      const result = await userService.getUsers(ctx.query);

      ctx.body = {
        success: true,
        data: result.users,
        pagination: result.pagination
      };
    } catch (error) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async getUserById(ctx) {
    try {
      const { id } = ctx.params;
      const user = await userService.getUserById(id);

      ctx.body = {
        success: true,
        data: user,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async updateUser(ctx) {
    try {
      const { id } = ctx.params;
      const updates = ctx.request.body;
      const updatedUser = await userService.updateUser(id, updates);
      const { passwordHash: _, ...userResponse } = updatedUser;

      ctx.body = {
        success: true,
        message: 'User updated successfully',
        data: userResponse,
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async deleteUser(ctx) {
    try {
      const { id } = ctx.params;
      await userService.deleteUser(id);

      ctx.body = {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new UserController();
