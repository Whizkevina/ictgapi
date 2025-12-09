/**
 * Service for interacting with the YouTube Data API
 * Used to check if a YouTube channel is currently streaming live
 */

// Get API key and channel ID from environment variables
const API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;
const CHANNEL_ID = process.env.REACT_APP_YOUTUBE_CHANNEL_ID;

/**
 * Check if a YouTube channel is currently live streaming
 * @returns {Promise<Object>} Object containing live status and stream details
 */
export const checkChannelLiveStatus = async () => {
  try {
    // First, search for live broadcasts from the channel
    const searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;
    
    const searchResponse = await fetch(searchEndpoint);
    
    // Handle 403 errors gracefully (API key issues)
    if (searchResponse.status === 403) {
      console.warn('YouTube API key has permissions issues (403 Forbidden)');
      return {
        isLive: false,
        liveStreamUrl: null,
        liveStreamTitle: null,
        viewerCount: 0,
        videoId: null,
        apiKeyIssue: true
      };
    }
    
    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    // If there are no live videos, return not live
    if (!searchData.items || searchData.items.length === 0) {
      return {
        isLive: false,
        liveStreamUrl: null,
        liveStreamTitle: null,
        viewerCount: 0,
        videoId: null
      };
    }
    
    // Get the video ID of the live stream
    const videoId = searchData.items[0].id.videoId;
    const liveStreamTitle = searchData.items[0].snippet.title;
    
    // Get video details including viewer count
    const videoEndpoint = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoId}&key=${API_KEY}`;
    
    const videoResponse = await fetch(videoEndpoint);
    
    if (!videoResponse.ok) {
      throw new Error(`YouTube API error: ${videoResponse.status}`);
    }
    
    const videoData = await videoResponse.json();
    
    if (!videoData.items || videoData.items.length === 0) {
      throw new Error('Could not retrieve video details');
    }
    
    const videoDetails = videoData.items[0];
    
    // Check if there are liveStreamingDetails
    if (!videoDetails.liveStreamingDetails) {
      return {
        isLive: false,
        liveStreamUrl: null,
        liveStreamTitle: null,
        viewerCount: 0,
        videoId: null
      };
    }
    
    // Get viewer count
    const viewerCount = videoDetails.liveStreamingDetails.concurrentViewers
      ? parseInt(videoDetails.liveStreamingDetails.concurrentViewers, 10)
      : 0;
      
    // Construct the stream URL
    const liveStreamUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    return {
      isLive: true,
      liveStreamUrl,
      liveStreamTitle,
      viewerCount,
      videoId
    };
  } catch (error) {
    console.error('Error checking YouTube live status:', error);
    // Return a default response on error
    return {
      isLive: false,
      liveStreamUrl: null,
      liveStreamTitle: null,
      viewerCount: 0,
      videoId: null,
      error: error.message
    };
  }
};

/**
 * Get viewer count for a specific YouTube video
 * @param {string} videoId - The YouTube video ID
 * @returns {Promise<number>} The current viewer count
 */
export const getVideoViewerCount = async (videoId) => {
  if (!videoId) return 0;
  
  try {
    const endpoint = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails&id=${videoId}&key=${API_KEY}`;
    
    const response = await fetch(endpoint);
    
    // Handle 403 errors gracefully (API key issues)
    if (response.status === 403) {
      console.warn('YouTube API key has permissions issues (403 Forbidden)');
      return 0;
    }
    
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.items || data.items.length === 0 || !data.items[0].liveStreamingDetails) {
      return 0;
    }
    
    const viewerCount = data.items[0].liveStreamingDetails.concurrentViewers
      ? parseInt(data.items[0].liveStreamingDetails.concurrentViewers, 10)
      : 0;
      
    return viewerCount;
  } catch (error) {
    console.error('Error getting YouTube viewer count:', error);
    return 0;
  }
};

const YouTubeService = {
  checkChannelLiveStatus,
  getVideoViewerCount
};

export default YouTubeService;
