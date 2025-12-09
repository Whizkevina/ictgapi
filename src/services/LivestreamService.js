/**
 * Service for updating livestream status in the backend
 */

import config from '../config/config';
import { buildLivestreamPayload } from '../utils/livestreamAdmin';

// API settings
const apiBaseUrl = config.api.baseUrl;
const updateEndpoint = config.api.endpoints.updateLivestream;
const updateUrl = `${apiBaseUrl}${updateEndpoint}`;

// Authentication token sourced from environment/config
const authToken = config.admin.authToken;

/**
 * Update the livestream status in the backend
 * @param {string|null} livestreamUrl - The URL of the livestream or null if no stream
 * @param {string} livestreamTitle - The title of the livestream
 * @returns {Promise<Object>} The API response
 */
export const updateLivestreamStatus = async (livestreamUrl, livestreamTitle) => {
  try {
    // Create complete payload with all expected fields
    if (!authToken) {
      throw new Error('Admin auth token is not configured. Please set REACT_APP_ADMIN_AUTH_TOKEN.');
    }

    const payload = buildLivestreamPayload({
      LiveStreamUrl: livestreamUrl,
      LiveStreamTitle: livestreamTitle || 'No Live Service'
    });

    // Use PUT method as required by the API
    const response = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-auth-token': authToken
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details');
      console.error('Server response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating livestream status:', error);
    throw error;
  }
};

/**
 * Clear the livestream status (set URL to null)
 * @param {string} title - Title to use for the "no stream" state
 * @returns {Promise<Object>} The API response
 */
export const clearLivestreamStatus = async (title = "No Live Service Available") => {
  return updateLivestreamStatus(null, title);
};

const LivestreamService = {
  updateLivestreamStatus,
  clearLivestreamStatus
};

export default LivestreamService;
