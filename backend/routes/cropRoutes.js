import express from 'express';
import {
    createCrop,
    getAllCrops,
    getCropById,
    getCropsByFarmer,
    getMyCrops,
    updateCrop,
    deleteCrop,
    toggleAvailability,
} from '../controllers/cropController.js';
import { verifyToken, authorize } from '../middleware/auth.js';
import { createCropValidation, mongoIdValidation, validate } from '../middleware/validation.js';
import { uploadMultiple } from '../utils/fileUpload.js';

const router = express.Router();

/**
 * @route   GET /api/crops
 * @desc    Get all crops with filtering
 * @access  Public
 */
router.get('/', getAllCrops);

/**
 * @route   POST /api/crops
 * @desc    Create a new crop listing
 * @access  Private (Farmer only)
 */
router.post(
    '/',
    verifyToken,
    authorize('farmer'),
    uploadMultiple,
    createCropValidation,
    validate,
    createCrop
);

/**
 * @route   GET /api/crops/my-crops
 * @desc    Get my crops (logged-in farmer)
 * @access  Private (Farmer only)
 */
router.get('/my-crops', verifyToken, authorize('farmer'), getMyCrops);

/**
 * @route   GET /api/crops/farmer/:farmerId
 * @desc    Get crops by farmer ID
 * @access  Public
 */
router.get('/farmer/:farmerId', mongoIdValidation, validate, getCropsByFarmer);

/**
 * @route   GET /api/crops/:id
 * @desc    Get single crop by ID
 * @access  Public
 */
router.get('/:id', mongoIdValidation, validate, getCropById);

/**
 * @route   PUT /api/crops/:id
 * @desc    Update crop
 * @access  Private (Farmer only - own crops)
 */
router.put(
    '/:id',
    verifyToken,
    authorize('farmer'),
    uploadMultiple,
    mongoIdValidation,
    validate,
    updateCrop
);

/**
 * @route   DELETE /api/crops/:id
 * @desc    Delete crop
 * @access  Private (Farmer only - own crops)
 */
router.delete(
    '/:id',
    verifyToken,
    authorize('farmer'),
    mongoIdValidation,
    validate,
    deleteCrop
);

/**
 * @route   PATCH /api/crops/:id/availability
 * @desc    Toggle crop availability
 * @access  Private (Farmer only - own crops)
 */
router.patch(
    '/:id/availability',
    verifyToken,
    authorize('farmer'),
    mongoIdValidation,
    validate,
    toggleAvailability
);

export default router;
