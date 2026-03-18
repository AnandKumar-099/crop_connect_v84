import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';

dotenv.config();

const seedRiskScores = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database.');

        const orders = await Order.find({ riskScore: { $exists: false } });
        console.log(`Found ${orders.length} orders missing riskScore.`);

        let updatedCount = 0;
        for (const order of orders) {
            order.riskScore = 0.5;
            order.riskLevel = 'MEDIUM';
            await order.save();
            updatedCount++;
        }

        console.log(`Successfully backfilled ${updatedCount} orders.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

seedRiskScores();
