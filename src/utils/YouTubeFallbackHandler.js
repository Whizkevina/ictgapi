/**
 * YouTubeFallbackHandler.js
 * 
 * This utility provides fallback mechanisms when the YouTube API is unavailable
 * or returns errors. It can use a configured fallback URL or fetch from alternative
 * sources if the main YouTube API fails.
 */

/**
 * Get the fallback stream URL from environment variables or config
 * @returns {string|null} The fallback stream URL or null if none configured
 */
export const getFallbackStreamUrl = () => {
  return process.env.REACT_APP_FALLBACK_STREAM_URL || null;
};

/**
 * Check if a video URL is likely a YouTube URL
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL is a YouTube URL
 */
export const isYouTubeUrl = (url) => {
  if (!url) return false;
  
  // Match common YouTube URL patterns
  return /youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed/.test(url);
};

/**
 * Extract the video ID from a YouTube URL
 * @param {string} url - The YouTube URL
 * @returns {string|null} The video ID or null if not found
 */
export const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Handle youtu.be short URLs
  if (url.includes('youtu.be/')) {
    const parts = url.split('youtu.be/');
    if (parts.length > 1) {
      // Remove any query parameters
      return parts[1].split(/[?&]/)[0];
    }
    return null;
  }
  
  // Handle standard youtube.com URLs
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      // For watch URLs
      if (urlObj.pathname.includes('/watch')) {
        return urlObj.searchParams.get('v');
      }
      
      // For embed URLs
      if (urlObj.pathname.includes('/embed/')) {
        const parts = urlObj.pathname.split('/embed/');
        if (parts.length > 1) {
          return parts[1].split(/[?&]/)[0];
        }
      }
    }
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
  }
  
  return null;
};

/**
 * Construct a direct embed URL for YouTube videos
 * @param {string} videoId - The YouTube video ID
 * @returns {string} The embed URL
 */
export const getYouTubeEmbedUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
};

/**
 * Check if a provided URL is accessible
 * This can be used to verify if a fallback URL is actually available
 * @param {string} url - The URL to check
 * @param {number} timeout - The timeout in milliseconds
 * @returns {Promise<boolean>} True if the URL is accessible
 */
export const isUrlAccessible = async (url, timeout = 5000) => {
  if (!url) return false;
  
  try {
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    // Try to fetch the URL (HEAD request if possible)
    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn(`URL ${url} is not accessible:`, error.message);
    return false;
  }
};

/**
 * Get the best available stream URL
 * This will check the fallback URL if provided, or use the main URL
 * @param {string|null} mainUrl - The main stream URL (from YouTube API)
 * @returns {Promise<string|null>} The best available URL or null if none available
 */
export const getBestAvailableStreamUrl = async (mainUrl) => {
  // If main URL is working, use it
  if (mainUrl && await isUrlAccessible(mainUrl)) {
    return mainUrl;
  }
  
  // Try fallback URL from environment
  const fallbackUrl = getFallbackStreamUrl();
  if (fallbackUrl && await isUrlAccessible(fallbackUrl)) {
    return fallbackUrl;
  }
  
  // No working URLs found
  return null;
};

/**
 * Extract helpful information from YouTube API errors
 * @param {Error} error - The error from the YouTube API
 * @returns {Object} An object with extracted error details
 */
export const extractYouTubeApiError = (error) => {
  try {
    // Try to parse the error message if it's a JSON string
    if (typeof error.message === 'string' && error.message.includes('{')) {
      const jsonStart = error.message.indexOf('{');
      const jsonPart = error.message.substring(jsonStart);
      const errorData = JSON.parse(jsonPart);
      
      return {
        code: errorData.error?.code,
        message: errorData.error?.message,
        status: errorData.error?.status,
        details: errorData.error?.errors || [],
        isQuotaExceeded: errorData.error?.errors?.some(e => 
          e.reason === 'quotaExceeded' || e.reason === 'dailyLimitExceeded'
        )
      };
    }
  } catch (parseError) {
    // If parsing fails, return a generic error object
    console.warn('Could not parse YouTube API error:', parseError);
  }
  
  // Default error object if parsing fails
  return {
    code: error.status || 500,
    message: error.message,
    status: 'UNKNOWN_ERROR',
    details: [],
    isQuotaExceeded: error.message?.includes('quota')
  };
};

// Export all functions in a single object
const YouTubeFallbackHandler = {
  getFallbackStreamUrl,
  isYouTubeUrl,
  extractYouTubeVideoId,
  getYouTubeEmbedUrl,
  isUrlAccessible,
  getBestAvailableStreamUrl,
  extractYouTubeApiError
};

export default YouTubeFallbackHandler;
