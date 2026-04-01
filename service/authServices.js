const jwt = require('jsonwebtoken');
const { getRepository } = require('../config/typeorm');
const { compareHash, generateRefreshToken, hashPassword } = require('../utils/auth');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

class AuthService {
  async login(username, password) {
    const userRepository = getRepository(User);
    const refreshTokenRepository = getRepository(RefreshToken);

    const user = await userRepository.findOne({ where: { username } });
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = compareHash(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    if (user.status !== 'active') {
      throw new Error('User account is not active');
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );

    const refreshTokenString = generateRefreshToken();
    const tokenHash = hashPassword(refreshTokenString);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await refreshTokenRepository.save({
      userId: user.id,
      tokenHash,
      expiresAt,
    });

    const { passwordHash: _, ...userResponse } = user;

    return {
      accessToken,
      refreshToken: refreshTokenString,
      user: userResponse,
    };
  }

  async refreshAccessToken(refreshToken) {
    const refreshTokenRepository = getRepository(RefreshToken);
    const userRepository = getRepository(User);

    const token = await refreshTokenRepository.findOne({
      where: { token: refreshToken, revokedAt: null },
      relations: ['user'],
    });

    if (!token || token.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await userRepository.findOne({ where: { id: token.userId } });
    if (!user || user.status !== 'active') {
      throw new Error('User is no longer active');
    }

    const accessToken = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '6h' }
    );

    return {
      accessToken,
      user: { id: user.id, username: user.username, email: user.email },
    };
  }

  async logout(refreshToken) {
    const refreshTokenRepository = getRepository(RefreshToken);

    const token = await refreshTokenRepository.findOne({
      where: { token: refreshToken },
    });

    if (token) {
      token.revokedAt = new Date();
      await refreshTokenRepository.save(token);
    }
  }
}

module.exports = new AuthService();
