// YouTubeFallbackHandler Integration Example

import React from 'react';
import YouTubeService from '../services/YouTubeService';
import YouTubeFallbackHandler from '../utils/YouTubeFallbackHandler';

/**
 * Example usage of YouTubeFallbackHandler
 * This demonstrates how to use the fallback handler when the YouTube API fails
 */
const YouTubeStreamExample = () => {
  const [streamUrl, setStreamUrl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchStreamData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get live status from YouTube API
        const youtubeStatus = await YouTubeService.checkChannelLiveStatus();
        
        // If YouTube API returned a valid stream URL, use it
        if (youtubeStatus.isLive && youtubeStatus.liveStreamUrl) {
          setStreamUrl(youtubeStatus.liveStreamUrl);
          setIsLoading(false);
          return;
        }
        
        // If YouTube API failed with an API key issue, try the fallback URL
        if (youtubeStatus.apiKeyIssue) {
          console.warn('YouTube API key issue detected, using fallback');
          
          // Get the fallback URL from environment variables
          const fallbackUrl = YouTubeFallbackHandler.getFallbackStreamUrl();
          
          if (fallbackUrl) {
            // Check if the fallback URL is actually accessible
            const isAccessible = await YouTubeFallbackHandler.isUrlAccessible(fallbackUrl);
            
            if (isAccessible) {
              setStreamUrl(fallbackUrl);
              setIsLoading(false);
              return;
            } else {
              console.error('Fallback URL is not accessible');
            }
          }
        }
        
        // If no stream URL is available, set error
        setError('No live stream is currently available');
        setStreamUrl(null);
      } catch (error) {
        console.error('Error fetching stream data:', error);
        
        // Extract useful information from YouTube API errors
        const errorDetails = YouTubeFallbackHandler.extractYouTubeApiError(error);
        
        // Show different error messages based on error type
        if (errorDetails.isQuotaExceeded) {
          setError('YouTube API quota exceeded. Please try again later.');
        } else {
          setError(`Error loading stream: ${errorDetails.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStreamData();
  }, []);
  
  // Handle YouTube URLs specially to optimize embedding
  const getOptimizedStreamUrl = (url) => {
    if (YouTubeFallbackHandler.isYouTubeUrl(url)) {
      const videoId = YouTubeFallbackHandler.extractYouTubeVideoId(url);
      if (videoId) {
        // Return the embed URL for better performance
        return YouTubeFallbackHandler.getYouTubeEmbedUrl(videoId);
      }
    }
    
    // Return the original URL if it's not a YouTube URL or we can't extract the video ID
    return url;
  };
  
  return (
    <div className="youtube-stream-example">
      {isLoading && (
        <div className="loading-state">Loading stream...</div>
      )}
      
      {!isLoading && error && (
        <div className="error-state">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Refresh
          </button>
        </div>
      )}
      
      {!isLoading && !error && streamUrl && (
        <div className="video-container">
          <iframe
            src={getOptimizedStreamUrl(streamUrl)}
            title="Live Stream"
            width="100%"
            height="400"
            frameBorder="0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
};

export default YouTubeStreamExample;
