const PricePackage = require('../models/PricePackage');
const Pricing = require('../models/Pricing');
const { validatePackage } = require('../validators/pricingValidator');

// Get all pricing packages
exports.getAllPricePackages = async (req, res) => {
  try {
    const pricePackages = await PricePackage.find({ 
      active: true,
      packageType: 'standard'
    }).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: pricePackages
    });
  } catch (error) {
    console.error('Error fetching price packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price packages',
      error: error.message
    });
  }
};

// Get all wedding pricing packages
exports.getWeddingPackages = async (req, res) => {
  try {
    const weddingPackages = await PricePackage.find({ 
      active: true,
      packageType: 'wedding'
    }).sort({ order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: weddingPackages
    });
  } catch (error) {
    console.error('Error fetching wedding packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wedding packages',
      error: error.message
    });
  }
};

// Get all pricing packages (admin version - includes inactive packages)
exports.getAllPricePackagesAdmin = async (req, res) => {
  try {
    let query = {};
    
    // Filter by package type if provided
    if (req.query.type && ['standard', 'wedding'].includes(req.query.type)) {
      query.packageType = req.query.type;
    }
    
    const pricePackages = await PricePackage.find(query).sort({ packageType: 1, order: 1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: pricePackages
    });
  } catch (error) {
    console.error('Error fetching price packages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price packages',
      error: error.message
    });
  }
};

// Get a single price package
exports.getPricePackage = async (req, res) => {
  try {
    const pricePackage = await PricePackage.findById(req.params.id);
    if (!pricePackage) {
      return res.status(404).json({
        success: false,
        message: 'Price package not found'
      });
    }
    res.status(200).json({
      success: true,
      data: pricePackage
    });
  } catch (error) {
    console.error('Error fetching price package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch price package',
      error: error.message
    });
  }
};

// Create a new price package
exports.createPricePackage = async (req, res) => {
  try {
    // Validate required fields
    const { title, price, features } = req.body;
    if (!title || !price || !features || !Array.isArray(features) || features.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title, price, and at least one feature are required'
      });
    }
    
    // Get the count of existing packages for ordering
    const packageType = req.body.packageType || 'standard';
    const count = await PricePackage.countDocuments({ packageType });
    
    const packageData = {
      ...req.body,
      order: count
    };
    
    const pricePackage = await PricePackage.create(packageData);
    
    res.status(201).json({
      success: true,
      message: 'Price package created successfully',
      data: pricePackage
    });
  } catch (error) {
    console.error('Error creating price package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create price package',
      error: error.message
    });
  }
};

// Update a price package
exports.updatePricePackage = async (req, res) => {
  try {
    let pricePackage = await PricePackage.findById(req.params.id);
    if (!pricePackage) {
      return res.status(404).json({
        success: false,
        message: 'Price package not found'
      });
    }
    
    const updatedPackage = await PricePackage.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Price package updated successfully',
      data: updatedPackage
    });
  } catch (error) {
    console.error('Error updating price package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update price package',
      error: error.message
    });
  }
};

// Delete a price package
exports.deletePricePackage = async (req, res) => {
  try {
    const pricePackage = await PricePackage.findById(req.params.id);
    if (!pricePackage) {
      return res.status(404).json({
        success: false,
        message: 'Price package not found'
      });
    }
    
    await PricePackage.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Price package deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting price package:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete price package',
      error: error.message
    });
  }
};

// Update price packages order
exports.updateOrder = async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items must be an array'
      });
    }
    
    const updates = items.map(item => {
      return PricePackage.findByIdAndUpdate(
        item.id,
        { order: item.order, updatedAt: Date.now() },
        { new: true }
      );
    });
    
    await Promise.all(updates);
    
    res.status(200).json({
      success: true,
      message: 'Price packages order updated successfully'
    });
  } catch (error) {
    console.error('Error updating price packages order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update price packages order',
      error: error.message
    });
  }
};

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await Pricing.find().sort({ order: 1 });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    console.error('Error fetching pricing packages:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const package = await Pricing.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    
    res.status(200).json({ success: true, data: package });
  } catch (error) {
    console.error('Error fetching pricing package:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get packages by category
exports.getPackagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const packages = await Pricing.find({ category }).sort({ order: 1 });
    
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    console.error('Error fetching pricing packages by category:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Get featured packages
exports.getFeaturedPackages = async (req, res) => {
  try {
    const packages = await Pricing.find({ featured: true }).sort({ order: 1 });
    res.status(200).json({ success: true, data: packages });
  } catch (error) {
    console.error('Error fetching featured packages:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a new package (admin only)
exports.createPackage = async (req, res) => {
  try {
    const { error } = validatePackage(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }
    
    // Get the count to set order if not provided
    if (!req.body.order) {
      const count = await Pricing.countDocuments();
      req.body.order = count + 1;
    }
    
    const newPackage = new Pricing(req.body);
    await newPackage.save();
    
    res.status(201).json({ success: true, data: newPackage });
  } catch (error) {
    console.error('Error creating pricing package:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a package (admin only)
exports.updatePackage = async (req, res) => {
  try {
    const { error } = validatePackage(req.body);
    if (error) {
      return res.status(400).json({ success: false, error: error.details[0].message });
    }
    
    const updatedPackage = await Pricing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedPackage) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    
    res.status(200).json({ success: true, data: updatedPackage });
  } catch (error) {
    console.error('Error updating pricing package:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Delete a package (admin only)
exports.deletePackage = async (req, res) => {
  try {
    const package = await Pricing.findByIdAndDelete(req.params.id);
    
    if (!package) {
      return res.status(404).json({ success: false, error: 'Package not found' });
    }
    
    // Update order for remaining packages
    await Pricing.updateMany(
      { order: { $gt: package.order } },
      { $inc: { order: -1 } }
    );
    
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting pricing package:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update packages order (admin only)
exports.updatePackagesOrder = async (req, res) => {
  try {
    const { packages } = req.body;
    
    if (!packages || !Array.isArray(packages)) {
      return res.status(400).json({ success: false, error: 'Invalid packages data' });
    }
    
    // Update each package order
    const updatePromises = packages.map(pkg => {
      return Pricing.findByIdAndUpdate(
        pkg.id,
        { order: pkg.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    res.status(200).json({ success: true, message: 'Packages order updated' });
  } catch (error) {
    console.error('Error updating packages order:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Set featured packages (admin only)
exports.setFeaturedPackages = async (req, res) => {
  try {
    const { packageIds } = req.body;
    
    if (!packageIds || !Array.isArray(packageIds)) {
      return res.status(400).json({ success: false, error: 'Invalid package IDs' });
    }
    
    // First, set all packages as not featured
    await Pricing.updateMany({}, { featured: false });
    
    // Then set the selected packages as featured
    await Pricing.updateMany(
      { _id: { $in: packageIds } },
      { featured: true }
    );
    
    res.status(200).json({ success: true, message: 'Featured packages updated' });
  } catch (error) {
    console.error('Error setting featured packages:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
}; 
 
 
 