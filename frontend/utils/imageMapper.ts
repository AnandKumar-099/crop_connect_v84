
// Map of crop names to high-quality public image URLs (Unsplash/Wikimedia)
const CROP_IMAGES: Record<string, string> = {
    // Key Grains
    'rice': 'https://plus.unsplash.com/premium_photo-1661962692059-55d5a4319814?q=80&w=2000&auto=format&fit=crop',
    'wheat': 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2000&auto=format&fit=crop',
    'corn': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2000&auto=format&fit=crop',
    'maize': 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2000&auto=format&fit=crop',
    'soybean': 'https://images.unsplash.com/photo-1599522316574-845d1566c5d8?q=80&w=2000&auto=format&fit=crop',

    // Vegetables
    'tomato': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2000&auto=format&fit=crop',
    'potato': 'https://images.unsplash.com/photo-1518977676651-b53c82a63460?q=80&w=2000&auto=format&fit=crop',
    'onion': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=2000&auto=format&fit=crop',
    'carrot': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=2000&auto=format&fit=crop',

    // Fruits
    'mango': 'https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=2000&auto=format&fit=crop',
    'banana': 'https://images.unsplash.com/photo-1603833665858-e61d17a86271?q=80&w=2000&auto=format&fit=crop',
    'apple': 'https://images.unsplash.com/photo-1613589925232-a5676ee52737?q=80&w=2000&auto=format&fit=crop',

    // Cash Crops
    'cotton': 'https://images.unsplash.com/photo-1594315590298-329f49c8dcb9?q=80&w=2000&auto=format&fit=crop',
    'sugarcane': 'https://images.unsplash.com/photo-1606869711681-30d4187ac7c5?q=80&w=2000&auto=format&fit=crop',
    'chilli': 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=2000&auto=format&fit=crop',
    'turmeric': 'https://images.unsplash.com/photo-1615485925763-867862f80904?q=80&w=2000&auto=format&fit=crop',
};

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop'; // General farm field

export const getCropImage = (cropName: string | undefined): string => {
    if (!cropName) return DEFAULT_IMAGE;

    const normalizedName = cropName.toLowerCase().trim();

    // Direct match
    if (CROP_IMAGES[normalizedName]) {
        return CROP_IMAGES[normalizedName];
    }

    // Partial match
    for (const key in CROP_IMAGES) {
        if (normalizedName.includes(key)) {
            return CROP_IMAGES[key];
        }
    }

    return DEFAULT_IMAGE;
};
