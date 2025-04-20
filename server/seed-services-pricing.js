const mongoose = require('mongoose');
require('dotenv').config();
const Service = require('./models/Service');
const PricePackage = require('./models/PricePackage');
const Pricing = require('./models/Pricing');

// Data from the static helpers
const services = [
    { title: "Photography", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua", animation: "left", icon: "📷" },
    { title: "Videography", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua", animation: "right", icon: "🎥" },
    { title: "Drone Photography", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua", animation: "top", icon: "🚁" },
    { title: "Product Photography", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua", animation: "down", icon: "🛍️" },
    { title: "Lightning Setup", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua", animation: "left", icon: "💡" },
    { title: "Video Editing", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt dolore magna aliqua", animation: "right", icon: "✂️" },
];

const pricingPackages = [
    {
        title: "Wedding Shoot",
        price: "₹49999",
        features: [
            "8 Hours Session",
            "300 Quality Images",
            "Private Online Photo Gallery",
            "Unlimited Coverage Locations",
            "A 30-60 Minute Edited HD Wedding Film"
        ],
        animation: "left",
        packageType: "standard"
    },
    {
        title: "Birthday Celebration",
        price: "₹24000",
        features: [
            "4 Hours Session",
            "200 Quality Images",
            "Private Online Photo Gallery",
            "Unlimited Coverage Locations",
            "A 20-40 Minute Edited HD Birthday Film"
        ],
        animation: "top",
        packageType: "standard"
    },
    {
        title: "Event Shoot",
        price: "₹32000",
        features: [
            "6 Hours Session",
            "250 Quality Images",
            "Private Online Photo Gallery",
            "Unlimited Coverage Locations",
            "A 30-60 Minute Edited HD Event Film"
        ],
        animation: "right",
        packageType: "standard"
    },
    {
        title: "Song Video Shoot",
        price: "₹56000",
        features: [
            "10 Hours Session",
            "Unlimited Quality Images",
            "Private Online Photo Gallery",
            "Unlimited Coverage Locations",
            "A 30-60 Minute Edited HD Song Video"
        ],
        animation: "left",
        packageType: "standard"
    },
    {
        title: "Corporate Event",
        price: "₹48000",
        features: [
            "8 Hours Session",
            "400 Quality Images",
            "Private Online Photo Gallery",
            "Unlimited Coverage Locations",
            "A 30-60 Minute Edited HD Corporate Film"
        ],
        animation: "down",
        packageType: "standard"
    },
    {
        title: "Portrait Session",
        price: "₹16000",
        features: [
            "2 Hours Session",
            "100 Quality Images",
            "Private Online Photo Gallery",
            "Unlimited Coverage Locations",
            "A 10-20 Minute Edited HD Portrait Film"
        ],
        animation: "right",
        packageType: "standard"
    }
];

const weddingPackages = [
    {
        title: "Traditional Wedding",
        price: "₹49,999",
        features: [
            "Traditional Photo",
            "Traditional Video",
            "Traditional Highlights",
            "250 Photos Album with Acrylic Pad",
            "2 Photo Frame"
        ],
        animation: "left",
        packageType: "wedding"
    },
    {
        title: "Silver Package",
        price: "₹75,000",
        features: [
            "Traditional Photo",
            "Traditional Video",
            "Cinematic Video Highlights",
            "300 Photos Album with Acrylic Pad",
            "2 Photo Frame",
            "Drone Coverage"
        ],
        animation: "top",
        packageType: "wedding"
    },
    {
        title: "Gold Package",
        price: "₹1,05,000",
        features: [
            "Traditional & Candid Photos",
            "Traditional & Cinematic Videos",
            "Cinematic Teaser",
            "Highlights Video & Reels",
            "Edited Photos",
            "400 Photos Album with Bug + Mini Album",
            "Drone Coverage"
        ],
        animation: "right",
        packageType: "wedding"
    }
];

// MongoDB connection
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully!');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

// Seed services
const seedServices = async () => {
    try {
        // Clear existing services
        await Service.deleteMany({});
        console.log('Cleared existing services');

        // Add new services
        const servicePromises = services.map(async (service, index) => {
            return await Service.create({
                ...service,
                order: index,
                active: true
            });
        });

        await Promise.all(servicePromises);
        console.log(`Added ${services.length} services successfully`);
    } catch (error) {
        console.error('Error seeding services:', error);
    }
};

// Seed price packages
const seedPricePackages = async () => {
    try {
        // Clear existing price packages
        await PricePackage.deleteMany({});
        console.log('Cleared existing price packages');

        // Add standard price packages
        const packagePromises = pricingPackages.map(async (pkg, index) => {
            return await PricePackage.create({
                ...pkg,
                order: index,
                active: true
            });
        });

        await Promise.all(packagePromises);
        console.log(`Added ${pricingPackages.length} standard pricing packages successfully`);

        // Add wedding price packages
        const weddingPromises = weddingPackages.map(async (pkg, index) => {
            return await PricePackage.create({
                ...pkg,
                order: index,
                active: true
            });
        });

        await Promise.all(weddingPromises);
        console.log(`Added ${weddingPackages.length} wedding pricing packages successfully`);
    } catch (error) {
        console.error('Error seeding price packages:', error);
    }
};

// Add advanced pricing packages (using the new Pricing model)
const seedAdvancedPricing = async () => {
    try {
        // Clear existing pricing data
        await Pricing.deleteMany({});
        console.log('Cleared existing advanced pricing data');

        // Map standard packages to the advanced pricing model
        const pricingData = pricingPackages.map((pkg, index) => ({
            title: pkg.title,
            description: `${pkg.title} package for professional photography services`,
            price: parseInt(pkg.price.replace(/[^\d]/g, '')), // Convert "₹24000" to 24000
            currency: 'USD',
            category: pkg.title.includes('Wedding') ? 'Wedding' : 
                     pkg.title.includes('Portrait') ? 'Portrait' : 
                     pkg.title.includes('Corporate') ? 'Commercial' : 'Event',
            features: pkg.features,
            duration: pkg.features.find(f => f.includes('Hours'))?.split(' ')[0] + ' hours',
            images: parseInt(pkg.features.find(f => f.includes('Images'))?.split(' ')[0]) || 200,
            order: index,
            featured: index === 0, // First package is featured
            popular: index === 2  // Third package is popular
        }));

        await Pricing.insertMany(pricingData);
        console.log(`Added ${pricingData.length} advanced pricing packages successfully`);
    } catch (error) {
        console.error('Error seeding advanced pricing data:', error);
    }
};

// Main function to run the seed script
const runSeed = async () => {
    try {
        await connectToMongoDB();
        await seedServices();
        await seedPricePackages();
        await seedAdvancedPricing();
        console.log('Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

// Run the script
runSeed(); 