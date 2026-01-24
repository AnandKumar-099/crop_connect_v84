import mongoose from 'mongoose';

/**
 * Order Schema
 * Represents orders placed by buyers for crops
 */
const orderSchema = new mongoose.Schema(
    {
        buyerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Buyer ID is required'],
            index: true,
        },
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Farmer ID is required'],
            index: true,
        },
        cropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop',
            required: [true, 'Crop ID is required'],
        },
        // Order details
        quantity: {
            type: Number,
            required: [true, 'Order quantity is required'],
            min: [1, 'Quantity must be at least 1'],
        },
        totalPrice: {
            type: Number,
            required: [true, 'Total price is required'],
            min: [0, 'Total price cannot be negative'],
        },
        // Order status
        status: {
            type: String,
            enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
            default: 'pending',
        },
        // Payment information
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
        },
        paymentMethod: {
            type: String,
            enum: ['cash', 'online', 'bank_transfer', 'other'],
            default: 'cash',
        },
        // Delivery information
        deliveryAddress: {
            type: String,
            required: [true, 'Delivery address is required'],
            trim: true,
        },
        deliveryDate: {
            type: Date,
        },
        // Additional notes
        buyerNotes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        farmerNotes: {
            type: String,
            trim: true,
            maxlength: [500, 'Notes cannot exceed 500 characters'],
        },
        // Rejection reason (if applicable)
        rejectionReason: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient queries
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
