const authService = require('../service/authServices');

class AuthController {
  async login(ctx) {
    try {
      const { username, password } = ctx.request.body;
      const result = await authService.login(username, password);

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Login successful',
        data: result,
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async refreshToken(ctx) {
    try {
      const { refreshToken } = ctx.request.body;
      const result = await authService.refreshAccessToken(refreshToken);

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      };
    } catch (error) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }

  async logout(ctx) {
    try {
      const { refreshToken } = ctx.request.body;
      await authService.logout(refreshToken);

      ctx.status = 200;
      ctx.body = {
        success: true,
        message: 'Logout successful',
      };
    } catch (error) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: error.message,
      };
    }
  }
}

module.exports = new AuthController();
