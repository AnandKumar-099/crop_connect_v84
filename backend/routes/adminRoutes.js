import express from 'express';
import {
    getDashboardStats,
    getAllUsers,
    getUserById,
    toggleBanUser,
    toggleActivateUser,
    deleteUser,
    getAllCropsAdmin,
    deleteCrop,
    getAllOrders,
} from '../controllers/adminController.js';
import { verifyToken, authorize } from '../middleware/auth.js';
import { mongoIdValidation, validate } from '../middleware/validation.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, authorize('admin'));

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats', getDashboardStats);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin only)
 */
router.get('/users', getAllUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID
 * @access  Private (Admin only)
 */
router.get('/users/:id', mongoIdValidation, validate, getUserById);

/**
 * @route   PATCH /api/admin/users/:id/ban
 * @desc    Ban/Unban user
 * @access  Private (Admin only)
 */
router.patch('/users/:id/ban', mongoIdValidation, validate, toggleBanUser);

/**
 * @route   PATCH /api/admin/users/:id/activate
 * @desc    Activate/Deactivate user
 * @access  Private (Admin only)
 */
router.patch('/users/:id/activate', mongoIdValidation, validate, toggleActivateUser);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', mongoIdValidation, validate, deleteUser);

/**
 * @route   GET /api/admin/crops
 * @desc    Get all crop listings
 * @access  Private (Admin only)
 */
router.get('/crops', getAllCropsAdmin);

/**
 * @route   DELETE /api/admin/crops/:id
 * @desc    Delete crop listing
 * @access  Private (Admin only)
 */
router.delete('/crops/:id', mongoIdValidation, validate, deleteCrop);

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders
 * @access  Private (Admin only)
 */
router.get('/orders', getAllOrders);

export default router;
