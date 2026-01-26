import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Application configuration
 * All environment variables are accessed through this config object
 */
const config = {
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,

    // Database
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cropconnect',

    // JWT
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'default_access_secret_change_me',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me',
    jwtAccessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',

    // CORS
    clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

    // File Upload
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
};

// Validate required environment variables in production
if (config.nodeEnv === 'production') {
    const requiredEnvVars = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            console.error(`❌ Missing required environment variable: ${envVar}`);
            process.exit(1);
        }
    }
}

export default config;
