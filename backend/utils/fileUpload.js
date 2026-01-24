import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Configure multer for file uploads
 * Stores files in uploads/crops directory
 */

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads/crops'));
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomstring-originalname
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false);
    }
};

// Multer configuration
export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
    fileFilter,
});

/**
 * Middleware to handle single file upload
 */
export const uploadSingle = upload.single('image');

/**
 * Middleware to handle multiple file uploads (max 5)
 */
export const uploadMultiple = upload.array('images', 5);
