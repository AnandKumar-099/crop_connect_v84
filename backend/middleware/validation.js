import { body, param, query, validationResult } from 'express-validator';

/**
 * Middleware to check validation results
 * Must be used after validation rules
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
            })),
        });
    }

    next();
};

/**
 * Validation rules for user registration
 */
export const registerValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 100 })
        .withMessage('Name cannot exceed 100 characters'),

    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),

    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['farmer', 'buyer', 'admin'])
        .withMessage('Role must be farmer, buyer, or admin'),

    body('phone')
        .trim()
        .notEmpty()
        .withMessage('Phone number is required'),

    // Conditional validation for farmer role
    body('farmDetails.farmName')
        .if(body('role').equals('farmer'))
        .notEmpty()
        .withMessage('Farm name is required for farmers'),

    body('farmDetails.address')
        .if(body('role').equals('farmer'))
        .notEmpty()
        .withMessage('Farm address is required for farmers'),
];

/**
 * Validation rules for login
 */
export const loginValidation = [
    body('email')
        .trim()
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Please provide a valid email')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

/**
 * Validation rules for creating a crop
 */
export const createCropValidation = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Crop name is required')
        .isLength({ max: 100 })
        .withMessage('Crop name cannot exceed 100 characters'),

    body('type')
        .notEmpty()
        .withMessage('Crop type is required')
        .isIn(['Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices', 'Other'])
        .withMessage('Invalid crop type'),

    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isFloat({ min: 0 })
        .withMessage('Quantity must be a positive number'),

    body('unit')
        .notEmpty()
        .withMessage('Unit is required')
        .isIn(['kg', 'quintal', 'ton', 'piece', 'dozen'])
        .withMessage('Invalid unit'),

    body('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),

    body('location.address')
        .trim()
        .notEmpty()
        .withMessage('Location address is required'),
];

/**
 * Validation rules for creating an order
 */
export const createOrderValidation = [
    body('cropId')
        .notEmpty()
        .withMessage('Crop ID is required')
        .isMongoId()
        .withMessage('Invalid crop ID'),

    body('quantity')
        .notEmpty()
        .withMessage('Quantity is required')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),

    body('deliveryAddress')
        .trim()
        .notEmpty()
        .withMessage('Delivery address is required'),

    body('paymentMethod')
        .optional()
        .isIn(['cash', 'online', 'bank_transfer', 'other'])
        .withMessage('Invalid payment method'),
];

/**
 * Validation rules for sending a message
 */
export const sendMessageValidation = [
    body('receiverId')
        .notEmpty()
        .withMessage('Receiver ID is required')
        .isMongoId()
        .withMessage('Invalid receiver ID'),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Message content is required')
        .isLength({ max: 1000 })
        .withMessage('Message cannot exceed 1000 characters'),
];

/**
 * Validation for MongoDB ObjectId params
 */
export const mongoIdValidation = [
    param('id')
        .isMongoId()
        .withMessage('Invalid ID format'),
];
