const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Configure Cloudinary storage for multer
 * Default transformation will be applied if no specific options are provided
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'portfolio',
    format: async (req, file) => {
      // Extract format from the original file or default to 'webp'
      return req.body.format || 'webp';
    },
    public_id: (req, file) => {
      // Create a unique filename
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.originalname.split('.')[0];
      return `${filename}-${uniqueSuffix}`;
    },
    transformation: [
      {
        // Default transformations that will be overridden by request params if provided
        width: 1200,
        quality: 'auto',
        fetch_format: 'auto'
      }
    ]
  }
});

// Create multer upload instance
const cloudinaryUpload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max file size
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Apply custom transformations to the image URL
const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return null;
  
  // Extract the base URL and the version part
  const regex = /(.*\/upload\/)(v\d+\/)(.*)/;
  const match = url.match(regex);
  
  if (!match) return url;
  
  const [, uploadPrefix, version, resourcePath] = match;
  
  // Build transformation string
  let transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  if (options.quality) transformations.push(`q_${options.quality}`);
  if (options.format) transformations.push(`f_${options.format}`);
  
  // If no transformations are specified, return original URL
  if (transformations.length === 0) return url;
  
  const transformationString = transformations.join(',');
  
  // Return the modified URL with transformations
  return `${uploadPrefix}${transformationString}/${version}${resourcePath}`;
};

// Delete an image from Cloudinary
const deleteImage = async (url) => {
  try {
    if (!url) return null;
    
    const publicId = getPublicIdFromUrl(url);
    if (!publicId) return null;
    
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

// Extract public ID from Cloudinary URL
const getPublicIdFromUrl = (url) => {
  try {
    if (!url) return null;
    
    // Extract the public ID from URL
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/;
    const match = url.match(regex);
    
    if (!match || !match[1]) return null;
    
    return match[1];
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
};

module.exports = {
  cloudinary,
  cloudinaryUpload,
  deleteImage,
  getPublicIdFromUrl,
  getOptimizedImageUrl
}; 