import express from 'express';
import {
    createOrder,
    getMyOrders,
    getFarmerOrders,
    getOrderById,
    acceptOrder,
    rejectOrder,
    completeOrder,
    cancelOrder,
    updatePaymentStatus,
    downloadAgreementPDF,
} from '../controllers/orderController.js';
import { verifyToken, authorize } from '../middleware/auth.js';
import { createOrderValidation, mongoIdValidation, validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Buyer only)
 */
router.post(
    '/',
    verifyToken,
    authorize('buyer'),
    createOrderValidation,
    validate,
    createOrder
);

/**
 * @route   GET /api/orders/my-orders
 * @desc    Get all orders for buyer
 * @access  Private (Buyer only)
 */
router.get('/my-orders', verifyToken, authorize('buyer'), getMyOrders);

/**
 * @route   GET /api/orders/farmer-orders
 * @desc    Get all orders for farmer
 * @access  Private (Farmer only)
 */
router.get('/farmer-orders', verifyToken, authorize('farmer'), getFarmerOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private (Buyer or Farmer involved)
 */
router.get('/:id', verifyToken, mongoIdValidation, validate, getOrderById);

/**
 * @route   PATCH /api/orders/:id/accept
 * @desc    Accept order (Farmer)
 * @access  Private (Farmer only)
 */
router.patch(
    '/:id/accept',
    verifyToken,
    authorize('farmer'),
    mongoIdValidation,
    validate,
    acceptOrder
);

/**
 * @route   PATCH /api/orders/:id/reject
 * @desc    Reject order (Farmer)
 * @access  Private (Farmer only)
 */
router.patch(
    '/:id/reject',
    verifyToken,
    authorize('farmer'),
    mongoIdValidation,
    validate,
    rejectOrder
);

/**
 * @route   PATCH /api/orders/:id/complete
 * @desc    Mark order as completed
 * @access  Private (Farmer only)
 */
router.patch(
    '/:id/complete',
    verifyToken,
    authorize('farmer'),
    mongoIdValidation,
    validate,
    completeOrder
);

/**
 * @route   PATCH /api/orders/:id/cancel
 * @desc    Cancel order (Buyer)
 * @access  Private (Buyer only)
 */
router.patch(
    '/:id/cancel',
    verifyToken,
    authorize('buyer'),
    mongoIdValidation,
    validate,
    cancelOrder
);

/**
 * @route   PATCH /api/orders/:id/payment
 * @desc    Update payment status
 * @access  Private (Buyer or Farmer)
 */
router.patch(
    '/:id/payment',
    verifyToken,
    mongoIdValidation,
    validate,
    updatePaymentStatus
);

/**
 * @route   GET /api/orders/:id/pdf
 * @desc    Download agreement as PDF
 * @access  Private (Buyer or Farmer involved)
 */
router.get('/:id/pdf', verifyToken, mongoIdValidation, validate, downloadAgreementPDF);

export default router;
