// API utility functions for making requests to the backend

/**
 * Fetch all portfolio items from the API
 * @returns {Promise<Array>} Portfolio items array
 */
export const fetchPortfolioItems = async () => {
  try {
    const response = await fetch('/api/portfolio');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio items: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data; // The actual array of portfolio items
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    throw error;
  }
};

/**
 * Fetch a single portfolio item by ID
 * @param {string} id - Portfolio item ID
 * @returns {Promise<Object>} Portfolio item
 */
export const fetchPortfolioItem = async (id) => {
  try {
    const response = await fetch(`/api/portfolio/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch portfolio item: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error(`Error fetching portfolio item ${id}:`, error);
    throw error;
  }
}; 