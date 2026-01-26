import User from '../models/User.js';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
    const [
        totalUsers,
        totalFarmers,
        totalBuyers,
        totalCrops,
        totalOrders,
        pendingOrders,
        completedOrders,
    ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'farmer' }),
        User.countDocuments({ role: 'buyer' }),
        Crop.countDocuments(),
        Order.countDocuments(),
        Order.countDocuments({ status: 'pending' }),
        Order.countDocuments({ status: 'completed' }),
    ]);

    res.json({
        success: true,
        data: {
            users: {
                total: totalUsers,
                farmers: totalFarmers,
                buyers: totalBuyers,
            },
            crops: totalCrops,
            orders: {
                total: totalOrders,
                pending: pendingOrders,
                completed: completedOrders,
            },
        },
    });
});

/**
 * @desc    Get all users
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
    const { role, isActive, isBanned, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isBanned !== undefined) filter.isBanned = isBanned === 'true';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
        User.find(filter)
            .select('-password -refreshToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        User.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            users,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            },
        },
    });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password -refreshToken');

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // Get user's crops if farmer
    let crops = [];
    if (user.role === 'farmer') {
        crops = await Crop.find({ farmerId: user._id });
    }

    // Get user's orders
    const orders = await Order.find({
        $or: [{ buyerId: user._id }, { farmerId: user._id }],
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: {
            user,
            crops,
            orders,
        },
    });
});

/**
 * @desc    Ban/Unban user
 * @route   PATCH /api/admin/users/:id/ban
 * @access  Private (Admin only)
 */
export const toggleBanUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // Cannot ban admin users
    if (user.role === 'admin') {
        return res.status(400).json({
            success: false,
            message: 'Cannot ban admin users',
        });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isBanned ? 'banned' : 'unbanned'} successfully`,
        data: { user: user.toPublicJSON() },
    });
});

/**
 * @desc    Activate/Deactivate user
 * @route   PATCH /api/admin/users/:id/activate
 * @access  Private (Admin only)
 */
export const toggleActivateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        success: true,
        message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user: user.toPublicJSON() },
    });
});

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
export const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found',
        });
    }

    // Cannot delete admin users
    if (user.role === 'admin') {
        return res.status(400).json({
            success: false,
            message: 'Cannot delete admin users',
        });
    }

    await user.deleteOne();

    res.json({
        success: true,
        message: 'User deleted successfully',
    });
});

/**
 * @desc    Get all crop listings
 * @route   GET /api/admin/crops
 * @access  Private (Admin only)
 */
export const getAllCropsAdmin = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [crops, total] = await Promise.all([
        Crop.find()
            .populate('farmerId', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Crop.countDocuments(),
    ]);

    res.json({
        success: true,
        data: {
            crops,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            },
        },
    });
});

/**
 * @desc    Delete crop listing
 * @route   DELETE /api/admin/crops/:id
 * @access  Private (Admin only)
 */
export const deleteCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
        return res.status(404).json({
            success: false,
            message: 'Crop not found',
        });
    }

    await crop.deleteOne();

    res.json({
        success: true,
        message: 'Crop listing deleted successfully',
    });
});

/**
 * @desc    Get all orders
 * @route   GET /api/admin/orders
 * @access  Private (Admin only)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate('buyerId', 'name email phone')
            .populate('farmerId', 'name email phone')
            .populate('cropId', 'name type price')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(filter),
    ]);

    res.json({
        success: true,
        data: {
            orders,
            pagination: {
                total,
                page: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                limit: parseInt(limit),
            },
        },
    });
});
