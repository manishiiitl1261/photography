/**
 * Helper functions for authentication, token management, and error handling
 */

/**
 * Handles unauthorized (401) responses by clearing auth tokens
 * and providing a consistent error message
 * 
 * @param {Response} response - The fetch response object
 * @throws {Error} Throws an error with appropriate message
 */
export const handleAuthError = (response) => {
  if (response.status === 401) {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    throw new Error('Authentication required. Please log in again.');
  }
  
  // Handle other status codes
  throw new Error(`HTTP error! Status: ${response.status}`);
};

/**
 * Gets authentication headers for API requests
 * 
 * @returns {Object} Headers object with Content-Type and Authorization
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

/**
 * Checks if user is authenticated by verifying token existence
 * 
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Gets user data from localStorage
 * 
 * @returns {Object|null} User object or null if not found
 */
export const getUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (err) {
    console.error('Error parsing user data:', err);
    return null;
  }
};

/**
 * Gets user role from stored user data
 * 
 * @returns {string|null} User role or null if not found
 */
export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

/**
 * Checks if user is an admin
 * 
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

/**
 * Logs out user by clearing all auth data
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}; 