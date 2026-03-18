import Message from '../models/Message.js';
import { asyncHandler } from '../middleware/errorHandler.js';

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = asyncHandler(async (req, res) => {
    const { receiverId, content, relatedOrderId, relatedCropId } = req.body;

    const message = await Message.create({
        senderId: req.user._id,
        receiverId,
        content,
        relatedOrderId,
        relatedCropId,
    });

    await message.populate([
        { path: 'senderId', select: 'name email profileImageUrl' },
        { path: 'receiverId', select: 'name email profileImageUrl' },
    ]);

    res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: { message },
    });
});

/**
 * @desc    Get conversation between two users
 * @route   GET /api/messages/conversation/:id
 * @access  Private
 */
export const getConversation = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    const messages = await Message.find({
        $or: [
            { senderId: req.user._id, receiverId: userId },
            { senderId: userId, receiverId: req.user._id },
        ],
    })
        .populate('senderId', 'name email profileImageUrl')
        .populate('receiverId', 'name email profileImageUrl')
        .sort({ createdAt: 1 });

    res.json({
        success: true,
        data: { messages, count: messages.length },
    });
});

/**
 * @desc    Get all conversations for logged-in user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = asyncHandler(async (req, res) => {
    // Get all unique users the current user has messaged with
    const messages = await Message.find({
        $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
    })
        .populate('senderId', 'name email profileImageUrl')
        .populate('receiverId', 'name email profileImageUrl')
        .sort({ createdAt: -1 });

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages.forEach((message) => {
        const partnerId =
            message.senderId._id.toString() === req.user._id.toString()
                ? message.receiverId._id.toString()
                : message.senderId._id.toString();

        if (!conversationsMap.has(partnerId)) {
            const partner =
                message.senderId._id.toString() === req.user._id.toString()
                    ? message.receiverId
                    : message.senderId;

            conversationsMap.set(partnerId, {
                partner,
                lastMessage: message,
                unreadCount: 0,
            });
        }

        // Count unread messages
        if (
            message.receiverId._id.toString() === req.user._id.toString() &&
            !message.isRead
        ) {
            conversationsMap.get(partnerId).unreadCount++;
        }
    });

    const conversations = Array.from(conversationsMap.values());

    res.json({
        success: true,
        data: { conversations, count: conversations.length },
    });
});

/**
 * @desc    Mark messages as read
 * @route   PATCH /api/messages/read/:id
 * @access  Private
 */
export const markAsRead = asyncHandler(async (req, res) => {
    const userId = req.params.id;

    await Message.updateMany(
        {
            senderId: userId,
            receiverId: req.user._id,
            isRead: false,
        },
        {
            isRead: true,
            readAt: new Date(),
        }
    );

    res.json({
        success: true,
        message: 'Messages marked as read',
    });
});

/**
 * @desc    Get unread message count
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
export const getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Message.countDocuments({
        receiverId: req.user._id,
        isRead: false,
    });

    res.json({
        success: true,
        data: { unreadCount: count },
    });
});

/**
 * @desc    Delete a message
 * @route   DELETE /api/messages/:id
 * @access  Private
 */
export const deleteMessage = asyncHandler(async (req, res) => {
    const message = await Message.findById(req.params.id);

    if (!message) {
        return res.status(404).json({
            success: false,
            message: 'Message not found',
        });
    }

    // Only sender can delete
    if (message.senderId.toString() !== req.user._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'Not authorized to delete this message',
        });
    }

    await message.deleteOne();

    res.json({
        success: true,
        message: 'Message deleted successfully',
    });
});
