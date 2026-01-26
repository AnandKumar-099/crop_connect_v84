import Crop from '../models/Crop.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Create a new crop listing
 * @route   POST /api/crops
 * @access  Private (Farmer only)
 */
export const createCrop = asyncHandler(async (req, res) => {
    const {
        name,
        type,
        description,
        quantity,
        unit,
        price,
        priceUnit,
        location,
        harvestDate,
        qualityGrade,
    } = req.body;

    // Handle uploaded images
    const images = req.files ? req.files.map((file) => `/uploads/crops/${file.filename}`) : [];

    const crop = await Crop.create({
        farmerId: req.user._id,
        name,
        type,
        description,
        quantity,
        unit,
        price,
        priceUnit,
        images,
        location,
        harvestDate,
        qualityGrade,
    });

    // Populate farmer details
    await crop.populate('farmerId', 'name email phone farmDetails');

    res.status(201).json({
        success: true,
        message: 'Crop listing created successfully',
        data: { crop },
    });
});

/**
 * @desc    Get all crops with filtering and pagination
 * @route   GET /api/crops
 * @access  Public
 */
export const getAllCrops = asyncHandler(async (req, res) => {
    const {
        type,
        minPrice,
        maxPrice,
        minQuantity,
        maxQuantity,
        city,
        state,
        search,
        page = 1,
        limit = 10,
    } = req.query;

    // Build filter object
    const filter = { isAvailable: true };

    if (type) filter.type = type;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (state) filter['location.state'] = new RegExp(state, 'i');

    if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (minQuantity || maxQuantity) {
        filter.quantity = {};
        if (minQuantity) filter.quantity.$gte = parseFloat(minQuantity);
        if (maxQuantity) filter.quantity.$lte = parseFloat(maxQuantity);
    }

    if (search) {
        filter.$or = [
            { name: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
        ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [crops, total] = await Promise.all([
        Crop.find(filter)
            .populate('farmerId', 'name email phone farmDetails profileImageUrl')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Crop.countDocuments(filter),
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
 * @desc    Get single crop by ID
 * @route   GET /api/crops/:id
 * @access  Public
 */
export const getCropById = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id).populate(
        'farmerId',
        'name email phone farmDetails profileImageUrl'
    );

    if (!crop) {
        return res.status(404).json({
            success: false,
            message: 'Crop not found',
        });
    }

    res.json({
        success: true,
        data: { crop },
    });
});

/**
 * @desc    Get crops by farmer ID
 * @route   GET /api/crops/farmer/:farmerId
 * @access  Public
 */
export const getCropsByFarmer = asyncHandler(async (req, res) => {
    const crops = await Crop.find({ farmerId: req.params.farmerId })
        .populate('farmerId', 'name email phone farmDetails profileImageUrl')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: { crops, count: crops.length },
    });
});

/**
 * @desc    Get my crops (logged-in farmer)
 * @route   GET /api/crops/my-crops
 * @access  Private (Farmer only)
 */
export const getMyCrops = asyncHandler(async (req, res) => {
    const crops = await Crop.find({ farmerId: req.user._id }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: { crops, count: crops.length },
    });
});

/**
 * @desc    Update crop
 * @route   PUT /api/crops/:id
 * @access  Private (Farmer only - own crops)
 */
export const updateCrop = asyncHandler(async (req, res) => {
    let crop = await Crop.findById(req.params.id);

    if (!crop) {
        return res.status(404).json({
            success: false,
            message: 'Crop not found',
        });
    }

    // Check ownership
    if (crop.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update this crop',
        });
    }

    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
        const newImages = req.files.map((file) => `/uploads/crops/${file.filename}`);
        req.body.images = [...(crop.images || []), ...newImages];
    }

    crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    }).populate('farmerId', 'name email phone farmDetails');

    res.json({
        success: true,
        message: 'Crop updated successfully',
        data: { crop },
    });
});

/**
 * @desc    Delete crop
 * @route   DELETE /api/crops/:id
 * @access  Private (Farmer only - own crops)
 */
export const deleteCrop = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
        return res.status(404).json({
            success: false,
            message: 'Crop not found',
        });
    }

    // Check ownership
    if (crop.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this crop',
        });
    }

    await crop.deleteOne();

    res.json({
        success: true,
        message: 'Crop deleted successfully',
    });
});

/**
 * @desc    Toggle crop availability
 * @route   PATCH /api/crops/:id/availability
 * @access  Private (Farmer only - own crops)
 */
export const toggleAvailability = asyncHandler(async (req, res) => {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
        return res.status(404).json({
            success: false,
            message: 'Crop not found',
        });
    }

    // Check ownership
    if (crop.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to modify this crop',
        });
    }

    crop.isAvailable = !crop.isAvailable;
    await crop.save();

    res.json({
        success: true,
        message: `Crop ${crop.isAvailable ? 'marked as available' : 'marked as unavailable'}`,
        data: { crop },
    });
});
