import mongoose from 'mongoose';

/**
 * Crop Schema
 * Represents crop listings created by farmers
 */
const cropSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Farmer ID is required'],
            index: true,
        },
        name: {
            type: String,
            required: [true, 'Crop name is required'],
            trim: true,
            maxlength: [100, 'Crop name cannot exceed 100 characters'],
        },
        type: {
            type: String,
            required: [true, 'Crop type is required'],
            enum: [
                'Grains',
                'Vegetables',
                'Fruits',
                'Pulses',
                'Oilseeds',
                'Spices',
                'Other',
            ],
            default: 'Other',
        },
        description: {
            type: String,
            trim: true,
            maxlength: [1000, 'Description cannot exceed 1000 characters'],
        },
        quantity: {
            type: Number,
            required: [true, 'Quantity is required'],
            min: [0, 'Quantity cannot be negative'],
        },
        unit: {
            type: String,
            required: [true, 'Unit is required'],
            enum: ['kg', 'quintal', 'ton', 'piece', 'dozen'],
            default: 'kg',
        },
        price: {
            type: Number,
            required: [true, 'Price is required'],
            min: [0, 'Price cannot be negative'],
        },
        priceUnit: {
            type: String,
            default: 'per kg',
            trim: true,
        },
        images: [
            {
                type: String, // URL or path to image
            },
        ],
        location: {
            address: {
                type: String,
                required: [true, 'Location address is required'],
                trim: true,
            },
            city: {
                type: String,
                trim: true,
            },
            state: {
                type: String,
                trim: true,
            },
            pincode: {
                type: String,
                trim: true,
            },
        },
        // Availability status
        isAvailable: {
            type: Boolean,
            default: true,
        },
        // Harvest date
        harvestDate: {
            type: Date,
        },
        // Quality grade (optional)
        qualityGrade: {
            type: String,
            enum: ['A', 'B', 'C', 'Not Graded'],
            default: 'Not Graded',
        },
    },
    {
        timestamps: true,
    }
);

// Index for search and filtering
cropSchema.index({ name: 'text', type: 1, 'location.city': 1 });
cropSchema.index({ price: 1, quantity: 1 });

const Crop = mongoose.model('Crop', cropSchema);

export default Crop;
