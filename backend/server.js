import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

import config from './config/config.js';
import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import cropRoutes from './routes/cropRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security Middleware
app.use(helmet({
<<<<<<< HEAD
    crossOriginResourcePolicy: { policy: "cross-origin" }
=======
    crossOriginResourcePolicy: { policy: "cross-origin" },
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
})); // Set security headers
app.use(mongoSanitize()); // Prevent NoSQL injection

// CORS Configuration
app.use(
    cors({
<<<<<<< HEAD
        origin: config.clientUrl,
        credentials: true,
    })
);

// Rate Limiting
=======
        origin: (origin, callback) => {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Allow any localhost origin
            if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
                return callback(null, true);
            }

            // Allow configured client URL
            if (origin === config.clientUrl) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);// Rate Limiting
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);

// Health Check Route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'CropConnect API is running',
        timestamp: new Date().toISOString(),
    });
});

// Root Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to CropConnect API',
        version: '1.0.0',
        documentation: '/api-docs',
    });
});

// 404 Handler
app.use(notFound);

// Error Handler (must be last)
app.use(errorHandler);

// Start Server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${config.nodeEnv} mode on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
    console.log(`🌐 Client URL: ${config.clientUrl}`);
    console.log(`\n✨ CropConnect Backend is ready!\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error(`❌ Unhandled Rejection: ${err.message}`);
<<<<<<< HEAD
    // Close server & exit process
    process.exit(1);
=======
    // Do not exit process in development to avoid crashing on token errors
    // process.exit(1);
>>>>>>> 3ed0358b8ff785f9044a74179d5f8514fd912bca
});

export default app;
