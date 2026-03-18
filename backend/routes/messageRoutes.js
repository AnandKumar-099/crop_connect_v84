import express from 'express';
import {
    sendMessage,
    getConversation,
    getConversations,
    markAsRead,
    getUnreadCount,
    deleteMessage,
} from '../controllers/messageController.js';
import { verifyToken } from '../middleware/auth.js';
import { sendMessageValidation, mongoIdValidation, validate } from '../middleware/validation.js';

const router = express.Router();

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
router.post('/', verifyToken, sendMessageValidation, validate, sendMessage);

/**
 * @route   GET /api/messages/conversations
 * @desc    Get all conversations
 * @access  Private
 */
router.get('/conversations', verifyToken, getConversations);

/**
 * @route   GET /api/messages/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count', verifyToken, getUnreadCount);

/**
 * @route   GET /api/messages/conversation/:id
 * @desc    Get conversation with specific user
 * @access  Private
 */
router.get(
    '/conversation/:id',
    verifyToken,
    mongoIdValidation,
    validate,
    getConversation
);

/**
 * @route   PATCH /api/messages/read/:id
 * @desc    Mark messages as read
 * @access  Private
 */
router.patch('/read/:id', verifyToken, mongoIdValidation, validate, markAsRead);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:id', verifyToken, mongoIdValidation, validate, deleteMessage);

export default router;
