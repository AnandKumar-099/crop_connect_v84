import User from '../models/User.js';
import { generateTokens, verifyRefreshToken } from '../utils/tokenUtils.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Register a new user (Farmer/Buyer/Admin)
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, farmDetails, profileImageUrl } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({
            success: false,
            message: 'User with this email already exists',
        });
    }

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        phone,
        farmDetails: role === 'farmer' ? farmDetails : undefined,
        profileImageUrl,
    });

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
            user: user.toPublicJSON(),
            accessToken,
            refreshToken,
        },
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
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

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            success: false,
            message: 'Invalid email or password',
        });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
        success: true,
        message: 'Login successful',
        data: {
            user: user.toPublicJSON(),
            accessToken,
            refreshToken,
        },
    });
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            message: 'Refresh token is required',
        });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user and check if refresh token matches
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
        return res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }

    // Generate new tokens
    const tokens = generateTokens(user._id);

    // Update refresh token in database
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = asyncHandler(async (req, res) => {
    // Clear refresh token from database
    req.user.refreshToken = null;
    await req.user.save();

    res.json({
        success: true,
        message: 'Logout successful',
    });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user.toPublicJSON(),
        },
    });
});
