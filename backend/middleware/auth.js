import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';

/**
 * Middleware to verify JWT access token
 * Attaches user object to req.user if valid
 */
export const verifyToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, config.jwtAccessSecret);

        // Get user from database (exclude password)
        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
        }

        // Check if user is banned
        if (user.isBanned) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been banned. Please contact support.',
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account is inactive.',
            });
        }

        // Attach user to request object
        req.user = user;
        next();
    } catch (error) {
<<<<<<< HEAD
=======
        console.error('Verify Token Error:', error); // Debug log
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired. Please login again.',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.',
        });
    }
};

/**
 * Middleware to check if user has required role(s)
 * @param {string[]} roles - Array of allowed roles
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`,
            });
        }

        next();
    };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that work differently for authenticated users
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtAccessSecret);
        const user = await User.findById(decoded.userId).select('-password -refreshToken');

        if (user && !user.isBanned && user.isActive) {
            req.user = user;
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
