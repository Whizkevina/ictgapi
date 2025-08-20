/**
 * Service for updating livestream status in the backend
 */

import config from '../config/config';

// API settings
const apiBaseUrl = config.api.baseUrl;
const updateEndpoint = config.api.endpoints.updateLivestream;
const updateUrl = `${apiBaseUrl}${updateEndpoint}`;

// Authentication token
const authToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZDFiYWRiNGQzNmIzNTAwMTE3MTJjZmUiLCJpYXQiOjE1NjIzMTYyMTV9.y2I7rR2qcd3-kRsRNCq_xGiSisoGWIcJXqvVI7QMiwI";

/**
 * Update the livestream status in the backend
 * @param {string|null} livestreamUrl - The URL of the livestream or null if no stream
 * @param {string} livestreamTitle - The title of the livestream
 * @returns {Promise<Object>} The API response
 */
export const updateLivestreamStatus = async (livestreamUrl, livestreamTitle) => {
  try {
    // Create complete payload with all expected fields
    const payload = {
      // Main fields that we're updating
      LiveStreamUrl: livestreamUrl,
      LiveStreamTitle: livestreamTitle || "No Live Service",
      
      // All other required fields with their default values
      AppVersion: "1.17",
      ForceUpdate: false,
      EnableGeoLocation: true,
      EnableGiving: true,
      IncrementOnlineUsers: true,
      OnlineUsersCount: 0,
      TestimoniesPlaceholder: "Testify to the goodness of the Lord in your life. Share your testimony with the brethren and be blessed.",
      AnnouncementsPlaceholder: "View announcements of upcoming church events and activities here.",
      PrivacyPolicyUrl: "https://ictgftadmin.com.ng/privacy",
      OnlineGivingUrl: "https://give.domi.org.ng",
      DownloadsUrl: "https://faithtabernacle.org.ng/downloads",
      OnlineBookStoreUrl: "https://domionlinestore.org",
      DomiRadio: "http://radio.shoutcastmedia.net:8302/stream",
      YouTubeClannelID: "UCyUKtrMdDilf74SPkCCKKtw",
      YouTubeApiKey: "AIzaSyCdyw5bijwAUuSGD-UGXkU3GUgv9XZGopw"
    };

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
