import Order from '../models/Order.js';
import Crop from '../models/Crop.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import PDFDocument from 'pdfkit';

/**
 * @desc    Create a new order
 * @route   POST /api/orders
 * @access  Private (Buyer only)
 */
export const createOrder = asyncHandler(async (req, res) => {
    const { cropId, quantity, deliveryAddress, paymentMethod, buyerNotes } = req.body;

    // Find the crop
    const crop = await Crop.findById(cropId).populate('farmerId');

    if (!crop) {
        return res.status(404).json({
            success: false,
            message: 'Crop not found',
        });
    }

    // Check if crop is available
    if (!crop.isAvailable) {
        return res.status(400).json({
            success: false,
            message: 'This crop is no longer available',
        });
    }

    // Check if sufficient quantity is available
    if (crop.quantity < quantity) {
        return res.status(400).json({
            success: false,
            message: `Only ${crop.quantity} ${crop.unit} available`,
        });
    }

    // Calculate total price
    const totalPrice = crop.price * quantity;

    // Get ML Risk Prediction
    let riskScore = 0.5;
    let riskLevel = 'MEDIUM';
    
    try {
        const mlResponse = await fetch('http://localhost:8000/predict-risk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                crop: crop.name,
                quantity: quantity,
                amount: totalPrice,
                past_defaults: 0,
                weather_risk: 0.5,
                reliability: 4.0
            })
        });
        
        if (mlResponse.ok) {
            const mlData = await mlResponse.json();
            riskScore = mlData.risk_score;
            riskLevel = mlData.risk_level;
        }
    } catch (error) {
        console.error('ML Risk Prediction Error:', error.message);
    }

    // Create order
    const order = await Order.create({
        buyerId: req.user._id,
        farmerId: crop.farmerId._id,
        cropId: crop._id,
        quantity,
        totalPrice,
        deliveryAddress: deliveryAddress || 'To Be Decided',
        paymentMethod,
        buyerNotes,
        riskScore,
        riskLevel
    });

    // Populate order details
    await order.populate([
        { path: 'buyerId', select: 'name email phone' },
        { path: 'farmerId', select: 'name email phone farmDetails' },
        { path: 'cropId' },
    ]);

    res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: { order },
    });
});

/**
 * @desc    Get all orders for buyer
 * @route   GET /api/orders/my-orders
 * @access  Private (Buyer only)
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = { buyerId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
        .populate('farmerId', 'name email phone farmDetails')
        .populate('cropId')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: { orders, count: orders.length },
    });
});

/**
 * @desc    Get all orders for farmer
 * @route   GET /api/orders/farmer-orders
 * @access  Private (Farmer only)
 */
export const getFarmerOrders = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const filter = { farmerId: req.user._id };
    if (status) filter.status = status;

    const orders = await Order.find(filter)
        .populate('buyerId', 'name email phone')
        .populate('cropId')
        .sort({ createdAt: -1 });

    res.json({
        success: true,
        data: { orders, count: orders.length },
    });
});

/**
 * @desc    Get single order by ID
 * @route   GET /api/orders/:id
 * @access  Private (Buyer or Farmer involved in the order)
 */
export const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('buyerId', 'name email phone')
        .populate('farmerId', 'name email phone farmDetails')
        .populate('cropId');

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user is involved in this order
    const isInvolved =
        order.buyerId._id.toString() === req.user._id.toString() ||
        order.farmerId._id.toString() === req.user._id.toString();

    if (!isInvolved && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to view this order',
        });
    }

    res.json({
        success: true,
        data: { order },
    });
});

/**
 * @desc    Accept order (Farmer)
 * @route   PATCH /api/orders/:id/accept
 * @access  Private (Farmer only)
 */
export const acceptOrder = asyncHandler(async (req, res) => {
    const { deliveryDate, farmerNotes } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if farmer owns this order
    if (order.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to accept this order',
        });
    }

    // Check if order is pending
    if (order.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: `Cannot accept order with status: ${order.status}`,
        });
    }

    // Update order
    order.status = 'accepted';
    if (deliveryDate) order.deliveryDate = deliveryDate;
    if (farmerNotes) order.farmerNotes = farmerNotes;
    await order.save();

    // Update crop quantity
    const crop = await Crop.findById(order.cropId);
    if (crop) {
        crop.quantity -= order.quantity;
        if (crop.quantity <= 0) {
            crop.isAvailable = false;
        }
        await crop.save();
    }

    await order.populate([
        { path: 'buyerId', select: 'name email phone' },
        { path: 'farmerId', select: 'name email phone farmDetails' },
        { path: 'cropId' },
    ]);

    res.json({
        success: true,
        message: 'Order accepted successfully',
        data: { order },
    });
});

/**
 * @desc    Reject order (Farmer)
 * @route   PATCH /api/orders/:id/reject
 * @access  Private (Farmer only)
 */
export const rejectOrder = asyncHandler(async (req, res) => {
    const { rejectionReason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if farmer owns this order
    if (order.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to reject this order',
        });
    }

    // Check if order is pending
    if (order.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: `Cannot reject order with status: ${order.status}`,
        });
    }

    // Update order
    order.status = 'rejected';
    order.rejectionReason = rejectionReason;
    await order.save();

    await order.populate([
        { path: 'buyerId', select: 'name email phone' },
        { path: 'farmerId', select: 'name email phone farmDetails' },
        { path: 'cropId' },
    ]);

    res.json({
        success: true,
        message: 'Order rejected',
        data: { order },
    });
});

/**
 * @desc    Mark order as completed
 * @route   PATCH /api/orders/:id/complete
 * @access  Private (Farmer only)
 */
export const completeOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if farmer owns this order
    if (order.farmerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to complete this order',
        });
    }

    // Check if order is accepted
    if (order.status !== 'accepted') {
        return res.status(400).json({
            success: false,
            message: 'Only accepted orders can be marked as completed',
        });
    }

    order.status = 'completed';
    await order.save();

    await order.populate([
        { path: 'buyerId', select: 'name email phone' },
        { path: 'farmerId', select: 'name email phone farmDetails' },
        { path: 'cropId' },
    ]);

    res.json({
        success: true,
        message: 'Order marked as completed',
        data: { order },
    });
});

/**
 * @desc    Cancel order (Buyer)
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (Buyer only)
 */
export const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if buyer owns this order
    if (order.buyerId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to cancel this order',
        });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
        return res.status(400).json({
            success: false,
            message: 'Only pending orders can be cancelled',
        });
    }

    order.status = 'cancelled';
    await order.save();

    await order.populate([
        { path: 'buyerId', select: 'name email phone' },
        { path: 'farmerId', select: 'name email phone farmDetails' },
        { path: 'cropId' },
    ]);

    res.json({
        success: true,
        message: 'Order cancelled successfully',
        data: { order },
    });
});

/**
 * @desc    Update payment status
 * @route   PATCH /api/orders/:id/payment
 * @access  Private (Buyer or Farmer)
 */
export const updatePaymentStatus = asyncHandler(async (req, res) => {
    const { paymentStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        return res.status(404).json({
            success: false,
            message: 'Order not found',
        });
    }

    // Check if user is involved in this order
    const isInvolved =
        order.buyerId.toString() === req.user._id.toString() ||
        order.farmerId.toString() === req.user._id.toString();

    if (!isInvolved) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to update payment status',
        });
    }

    order.paymentStatus = paymentStatus;
    await order.save();

    await order.populate([
        { path: 'buyerId', select: 'name email phone' },
        { path: 'farmerId', select: 'name email phone farmDetails' },
        { path: 'cropId' },
    ]);

    res.json({
        success: true,
        message: 'Payment status updated',
        data: { order },
    });
});

/**
 * @desc    Download PDF Agreement
 * @route   GET /api/orders/:id/pdf
 * @access  Private (Buyer or Farmer involved)
 */
export const downloadAgreementPDF = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('farmerId', 'name phone farmDetails address')
        .populate('buyerId', 'name phone address')
        .populate('cropId', 'cropName');

    if (!order) {
        res.status(404);
        throw new Error('Agreement not found');
    }

    if (
        order.buyerId._id.toString() !== req.user._id.toString() &&
        order.farmerId._id.toString() !== req.user._id.toString()
    ) {
        res.status(403);
        throw new Error('Not authorized to access this agreement');
    }

    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="agreement_${order._id}.pdf"`);
    
    doc.pipe(res);
    
    doc.fontSize(20).text('Crop Contract Agreement', { align: 'center' }).moveDown(2);
    
    doc.fontSize(12)
       .text(`Agreement ID: ${order._id}`)
       .text(`Date Created: ${new Date(order.createdAt).toLocaleDateString()}`)
       .text(`Status: ${order.status.toUpperCase()}`)
       .moveDown(1);
       
    doc.fontSize(14).text('Farmer Details', { underline: true }).moveDown(0.5);
    doc.fontSize(12)
       .text(`Name: ${order.farmerId.name}`)
       .text(`Phone: ${order.farmerId.phone}`)
       .text(`Address: ${order.farmerId.farmDetails?.address || order.farmerId.address || 'N/A'}`)
       .moveDown(1);
       
    doc.fontSize(14).text('Buyer Details', { underline: true }).moveDown(0.5);
    doc.fontSize(12)
       .text(`Name: ${order.buyerId.name}`)
       .text(`Phone: ${order.buyerId.phone}`)
       .text(`Address: ${order.deliveryAddress || order.buyerId.address || 'N/A'}`)
       .moveDown(1);
       
    const totalPrice = order.quantity * order.price;
    doc.fontSize(14).text('Crop Details', { underline: true }).moveDown(0.5);
    doc.fontSize(12)
       .text(`Crop Name: ${order.cropId ? order.cropId.cropName : 'N/A'}`)
       .text(`Quantity: ${order.quantity} kg`)
       .text(`Price per kg: Rs. ${order.price}`)
       .text(`Total Value: Rs. ${totalPrice.toLocaleString()}`)
       .moveDown(2);
       
    doc.fontSize(12).text('Signatures', { underline: true }).moveDown(1.5);
    
    const startY = doc.y;
    doc.text('_______________________', 50, startY);
    doc.text('Farmer Signature', 50, startY + 15);
    doc.text('_______________________', 350, startY);
    doc.text('Buyer Signature', 350, startY + 15);
    
    doc.end();
});
