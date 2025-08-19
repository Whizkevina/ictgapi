// Utility functions

/**
 * Handle API errors consistently
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error, context = 'API call') => {
  console.error(`Error in ${context}:`, error);
  
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection.';
  }
  
  if (error.message.includes('404')) {
    return 'Service not found. Please try again later.';
  }
  
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  
  return 'Something went wrong. Please try again later.';
};

/**
 * Format viewer count for display
 * @param {number|string} count - The viewer count
 * @returns {string} Formatted count
 */
export const formatViewerCount = (count) => {
  const num = parseInt(count) || 0;
  
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  
  return num.toString();
};

/**
 * Check if a URL is a valid video URL
 * @param {string} url - The URL to check
 * @returns {boolean} Whether the URL is valid
 */
export const isValidVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get user preferences from localStorage
 * @param {string} key - The preference key
 * @param {any} defaultValue - Default value if not found
 * @returns {any} The preference value
 */
export const getUserPreference = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch {
    return defaultValue;
  }
};

/**
 * Set user preference in localStorage
 * @param {string} key - The preference key
 * @param {any} value - The value to store
 */
export const setUserPreference = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving preference:', error);
  }
};

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - The function to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {Function} The debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};
