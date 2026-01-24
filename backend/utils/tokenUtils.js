import jwt from 'jsonwebtoken';
import config from '../config/config.js';

/**
 * Generate JWT access token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} JWT access token
 */
export const generateAccessToken = (userId) => {
    return jwt.sign(
        { userId },
        config.jwtAccessSecret,
        { expiresIn: config.jwtAccessExpire }
    );
};

/**
 * Generate JWT refresh token
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {string} JWT refresh token
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        config.jwtRefreshSecret,
        { expiresIn: config.jwtRefreshExpire }
    );
};

/**
 * Verify refresh token
 * @param {string} token - Refresh token to verify
 * @returns {object} Decoded token payload
 */
export const verifyRefreshToken = (token) => {
    return jwt.verify(token, config.jwtRefreshSecret);
};

/**
 * Generate both access and refresh tokens
 * @param {string} userId - User's MongoDB ObjectId
 * @returns {object} Object containing both tokens
 */
export const generateTokens = (userId) => {
    return {
        accessToken: generateAccessToken(userId),
        refreshToken: generateRefreshToken(userId),
    };
};
