import mongoose from 'mongoose';

/**
 * Message Schema
 * Simple messaging system between farmers and buyers
 * Uses subdocuments for conversation threads
 */
const messageSchema = new mongoose.Schema(
    {
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Sender ID is required'],
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Receiver ID is required'],
        },
        content: {
            type: String,
            required: [true, 'Message content is required'],
            trim: true,
            maxlength: [1000, 'Message cannot exceed 1000 characters'],
        },
        // Related order or crop (optional)
        relatedOrderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
        },
        relatedCropId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Crop',
        },
        // Message status
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for efficient message retrieval
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ isRead: 1 });

// Mark message as read
messageSchema.methods.markAsRead = function () {
    this.isRead = true;
    this.readAt = new Date();
    return this.save();
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
