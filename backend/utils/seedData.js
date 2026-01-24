import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';

dotenv.config();

/**
 * Seed script to populate database with sample data
 * Run with: npm run seed
 */

const seedData = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        await User.deleteMany({});
        await Crop.deleteMany({});
        await Order.deleteMany({});
        console.log('🗑️  Cleared existing data');

        // Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@cropconnect.com',
            password: 'admin123',
            role: 'admin',
            phone: '+91 9999999999',
        });
        console.log('👤 Created admin user');

        // Create Farmers
        const farmer1 = await User.create({
            name: 'Rajesh Kumar',
            email: 'rajesh@example.com',
            password: 'farmer123',
            role: 'farmer',
            phone: '+91 9876543210',
            farmDetails: {
                farmName: 'Kumar Farms',
                address: 'Village Rampur, Dist. Meerut',
                sizeInAcres: 25,
            },
        });

        const farmer2 = await User.create({
            name: 'Sunita Devi',
            email: 'sunita@example.com',
            password: 'farmer123',
            role: 'farmer',
            phone: '+91 9876543211',
            farmDetails: {
                farmName: 'Devi Organic Farms',
                address: 'Village Sultanpur, Dist. Lucknow',
                sizeInAcres: 15,
            },
        });

        console.log('👨‍🌾 Created farmers');

        // Create Buyers
        const buyer1 = await User.create({
            name: 'Amit Sharma',
            email: 'amit@example.com',
            password: 'buyer123',
            role: 'buyer',
            phone: '+91 9876543212',
        });

        const buyer2 = await User.create({
            name: 'Priya Singh',
            email: 'priya@example.com',
            password: 'buyer123',
            role: 'buyer',
            phone: '+91 9876543213',
        });

        console.log('🛒 Created buyers');

        // Create Crops
        const crops = await Crop.create([
            {
                farmerId: farmer1._id,
                name: 'Basmati Rice',
                type: 'Grains',
                description: 'Premium quality aged basmati rice',
                quantity: 500,
                unit: 'quintal',
                price: 4500,
                priceUnit: 'per quintal',
                location: {
                    address: 'Kumar Farms, Rampur',
                    city: 'Meerut',
                    state: 'Uttar Pradesh',
                    pincode: '250001',
                },
                harvestDate: new Date('2024-11-15'),
                qualityGrade: 'A',
            },
            {
                farmerId: farmer1._id,
                name: 'Wheat',
                type: 'Grains',
                description: 'High quality wheat suitable for flour',
                quantity: 1000,
                unit: 'quintal',
                price: 2200,
                priceUnit: 'per quintal',
                location: {
                    address: 'Kumar Farms, Rampur',
                    city: 'Meerut',
                    state: 'Uttar Pradesh',
                    pincode: '250001',
                },
                harvestDate: new Date('2024-12-01'),
                qualityGrade: 'A',
            },
            {
                farmerId: farmer2._id,
                name: 'Organic Tomatoes',
                type: 'Vegetables',
                description: 'Fresh organic tomatoes, pesticide-free',
                quantity: 200,
                unit: 'kg',
                price: 40,
                priceUnit: 'per kg',
                location: {
                    address: 'Devi Organic Farms, Sultanpur',
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    pincode: '226001',
                },
                harvestDate: new Date(),
                qualityGrade: 'A',
            },
            {
                farmerId: farmer2._id,
                name: 'Organic Potatoes',
                type: 'Vegetables',
                description: 'Farm-fresh organic potatoes',
                quantity: 500,
                unit: 'kg',
                price: 25,
                priceUnit: 'per kg',
                location: {
                    address: 'Devi Organic Farms, Sultanpur',
                    city: 'Lucknow',
                    state: 'Uttar Pradesh',
                    pincode: '226001',
                },
                harvestDate: new Date(),
                qualityGrade: 'B',
            },
            {
                farmerId: farmer1._id,
                name: 'Sugarcane',
                type: 'Other',
                description: 'Fresh sugarcane for juice and sugar production',
                quantity: 300,
                unit: 'quintal',
                price: 350,
                priceUnit: 'per quintal',
                location: {
                    address: 'Kumar Farms, Rampur',
                    city: 'Meerut',
                    state: 'Uttar Pradesh',
                    pincode: '250001',
                },
                harvestDate: new Date('2024-12-10'),
                qualityGrade: 'A',
            },
        ]);

        console.log('🌾 Created crop listings');

        // Create Sample Orders
        const orders = await Order.create([
            {
                buyerId: buyer1._id,
                farmerId: farmer1._id,
                cropId: crops[0]._id,
                quantity: 50,
                totalPrice: 225000,
                deliveryAddress: '123 Market Road, Delhi',
                status: 'pending',
                paymentMethod: 'bank_transfer',
                buyerNotes: 'Please ensure quality packaging',
            },
            {
                buyerId: buyer2._id,
                farmerId: farmer2._id,
                cropId: crops[2]._id,
                quantity: 100,
                totalPrice: 4000,
                deliveryAddress: '456 Bazaar Street, Noida',
                status: 'accepted',
                paymentMethod: 'cash',
                deliveryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            },
        ]);

        console.log('📦 Created sample orders');

        console.log('\n✅ Database seeded successfully!\n');
        console.log('📝 Sample Credentials:');
        console.log('   Admin: admin@cropconnect.com / admin123');
        console.log('   Farmer 1: rajesh@example.com / farmer123');
        console.log('   Farmer 2: sunita@example.com / farmer123');
        console.log('   Buyer 1: amit@example.com / buyer123');
        console.log('   Buyer 2: priya@example.com / buyer123\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

seedData();
