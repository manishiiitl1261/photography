/**
 * Utility functions for handling image URLs in the application
 */

/**
 * Determines the correct URL for an avatar image
 * Handles different types of paths:
 * - Full URLs (http/https)
 * - Cloudinary URLs
 * - Server-relative paths (/uploads/...)
 * - Filenames only
 * 
 * @param {string} avatar - The avatar path from the user object
 * @returns {string} The full URL to display the avatar
 */
export const getAvatarUrl = (avatar) => {
  // Return default avatar if no avatar is provided
  if (!avatar) return '/assets/avtar.png';
  
  // If it's already a full URL (Cloudinary or other external URL), use it directly
  if (avatar.startsWith('http')) {
    return avatar;
  }
  
  // If it's a server-side path (/uploads/...), prepend API URL
  if (avatar.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_API_URL}${avatar}`;
  }
  
  // Fallback for any other format (just filename)
  return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${avatar}`;
};

/**
 * Determines the correct URL for any image from the server
 * Similar to getAvatarUrl but with a different default
 * 
 * @param {string} imagePath - The image path
 * @param {string} defaultImage - Default image to use if none provided
 * @returns {string} The full URL to display the image
 */
export const getImageUrl = (imagePath, defaultImage = '/assets/placeholder.png') => {
  // Return default image if no path is provided
  if (!imagePath) return defaultImage;
  
  // If it's already a full URL (Cloudinary or other external URL), use it directly
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a server-side path (/uploads/...), prepend API URL
  if (imagePath.startsWith('/uploads/')) {
    return `${process.env.NEXT_PUBLIC_API_URL}${imagePath}`;
  }
  
  // Fallback for any other format (just filename)
  return `${process.env.NEXT_PUBLIC_API_URL}/uploads/${imagePath}`;
};