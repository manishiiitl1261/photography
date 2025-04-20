const Service = require('../models/Service');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const lang = req.query.lang || 'en'; // Default to English if no language specified
    const services = await Service.find({ active: true }).sort({ order: 1, createdAt: -1 });
    
    // Process translations if they exist
    const processedServices = services.map(service => {
      const serviceObj = service.toObject();
      
      // If translations exist for this language, use them
      if (serviceObj.translations && serviceObj.translations.has(lang)) {
        const translation = serviceObj.translations.get(lang);
        return {
          ...serviceObj,
          title: translation.title || serviceObj.title,
          description: translation.description || serviceObj.description
        };
      }
      
      return serviceObj;
    });
    
    res.status(200).json({
      success: true,
      data: processedServices
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// Get all services (admin version - includes inactive services)
exports.getAllServicesAdmin = async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1, createdAt: -1 });
    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// Get a single service
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
};

// Create a new service
exports.createService = async (req, res) => {
  try {
    // Validate required fields
    const { title, description, icon, translations } = req.body;
    if (!title || !description || !icon) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and icon are required'
      });
    }
    
    // Process translations - convert from object to Map
    let processedTranslations = {};
    if (translations && typeof translations === 'object') {
      // Convert regular object to Map-compatible format
      Object.keys(translations).forEach(lang => {
        if (translations[lang].title || translations[lang].description) {
          processedTranslations[lang] = {
            title: translations[lang].title || '',
            description: translations[lang].description || ''
          };
        }
      });
    }
    
    // Get the count of existing services for ordering
    const count = await Service.countDocuments();
    
    const serviceData = {
      ...req.body,
      translations: processedTranslations,
      order: count
    };
    
    const service = await Service.create(serviceData);
    
    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// Update a service
exports.updateService = async (req, res) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Process translations - convert from object to Map
    let processedTranslations = {};
    if (req.body.translations && typeof req.body.translations === 'object') {
      // Convert regular object to Map-compatible format
      Object.keys(req.body.translations).forEach(lang => {
        if (req.body.translations[lang].title || req.body.translations[lang].description) {
          processedTranslations[lang] = {
            title: req.body.translations[lang].title || '',
            description: req.body.translations[lang].description || ''
          };
        }
      });
      
      // Update the translations field only
      req.body.translations = processedTranslations;
    }
    
    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete a service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    await Service.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};

// Update services order
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
      // Handle both id and _id fields for compatibility
      const itemId = item._id || item.id;
      
      if (!itemId) {
        console.error('Missing ID field in item:', item);
        return Promise.resolve(null); // Skip items with no ID
      }
      
      return Service.findByIdAndUpdate(
        itemId,
        { order: item.order, updatedAt: Date.now() },
        { new: true }
      );
    });
    
    // Filter out null promises (items with no ID)
    const results = await Promise.all(updates.filter(Boolean));
    
    res.status(200).json({
      success: true,
      message: 'Services order updated successfully',
      data: results
    });
  } catch (error) {
    console.error('Error updating services order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update services order',
      error: error.message
    });
  }
}; 
 
 
 