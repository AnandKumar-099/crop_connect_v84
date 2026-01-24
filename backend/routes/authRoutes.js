import express from 'express';
import {
    register,
    login,
    refreshToken,
    logout,
    getMe,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { registerValidation, loginValidation, validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', registerValidation, validate, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginValidation, validate, login);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', refreshToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', verifyToken, logout);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', verifyToken, getMe);

export default router;
