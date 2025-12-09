# YouTube API Troubleshooting Guide

This guide provides steps to diagnose and resolve issues with the YouTube API integration in the ICTG Live Service application.

## Common Error Scenarios

### 1. 403 Forbidden Errors

**Symptoms:**

- Browser console shows: `YouTube API error: 403`
- The page shows "No Live Stream" even when a channel is live
- Warning message: "YouTube API key needs to be updated"

**Potential Causes:**

- Invalid API key
- API key without proper permissions
- Billing not enabled on Google Cloud project
- API quota exceeded

**Solutions:**

- Create a new API key following the [YouTube API Key Creation Guide](./YouTubeAPIKeyCreationGuide.md)
- Enable billing on your Google Cloud project
- Increase API quota limits if needed

### 2. API Not Detecting Live Stream

**Symptoms:**

- No stream is detected even though the channel is streaming
- Browser console doesn't show any errors

**Potential Causes:**

- Incorrect Channel ID in environment variables
- Stream not properly marked as "live" on YouTube
- Delay in YouTube API reflecting live status

**Solutions:**

- Verify the channel ID in `.env` file matches your YouTube channel
- Wait 3-5 minutes after starting a stream for API to update
- Check if stream is properly marked as "Public" on YouTube

### 3. Viewer Count Not Updating

**Symptoms:**

- Stream displays but viewer count stays at 0 or doesn't update
- Browser console shows intermittent errors

**Potential Causes:**

- API quota limitations
- Network connectivity issues
- Video ID reference lost during code execution

**Solutions:**

- Check for errors in browser console
- Verify current video ID is being stored in `currentVideoIdRef`
- Reduce polling frequency to avoid quota issues

## Debugging Steps

### Step 1: Check Browser Console

1. Open the browser developer tools (F12 or right-click > Inspect)
2. Go to the Console tab
3. Look for any errors related to YouTube API calls

### Step 2: Verify API Key and Environment Variables

1. Check `.env` file to ensure API key is set correctly:

   ```properties
   REACT_APP_YOUTUBE_API_KEY="your-key-here"
   REACT_APP_YOUTUBE_CHANNEL_ID="UCyUKtrMdDilf74SPkCCKKtw"
   ```

2. Test API key manually:
   - Open this URL in browser (replace `YOUR_API_KEY`):

   ```http
   https://www.googleapis.com/youtube/v3/channels?part=snippet&id=UCyUKtrMdDilf74SPkCCKKtw&key=YOUR_API_KEY
   ```

   - If you see JSON response, key is working
   - If you see error, follow the API key creation guide

### Step 3: Check Network Requests

1. In browser dev tools, go to the Network tab
2. Filter requests by typing "youtube" in the filter box
3. Look for requests to `googleapis.com`
4. Check status codes and responses

### Step 4: Test API in Isolation

Add this temporary code to test the API directly:

```javascript
// Add to LiveService.js temporarily for testing
useEffect(() => {
  const testAPI = async () => {
    try {
      console.log('Testing YouTube API...');
      const searchEndpoint = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${process.env.REACT_APP_YOUTUBE_CHANNEL_ID}&eventType=live&type=video&key=${process.env.REACT_APP_YOUTUBE_API_KEY}`;
      
      const response = await fetch(searchEndpoint);
      console.log('API Response Status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Data:', data);
      } else {
        const error = await response.text();
        console.error('API Error:', error);
      }
    } catch (error) {
      console.error('API Test Error:', error);
    }
  };
  
  testAPI();
}, []);
```

### Step 5: Enable Fallback Behavior

If YouTube API issues persist, ensure fallback behavior is working:

1. Check that `info.LiveStreamUrl` is properly set when a stream is available
2. Verify that error handling in `checkYouTubeLiveStatus()` sets `apiKeyIssue: true`
3. Make sure the frontend displays appropriate error messages

## Using Alternative Video Sources

If YouTube API integration continues to have issues, you can manually set the stream URL in the backend:

1. Use the LivestreamService directly:

   ```javascript
   import LivestreamService from '../services/LivestreamService';
   
   // Set a manual stream URL
   LivestreamService.updateLivestreamStatus(
     'https://www.youtube.com/watch?v=YOUR_VIDEO_ID',
     'Sunday Service - Manual Setup'
   );
   ```

2. For temporary testing, modify the `.env` file to include a fallback URL:

   ```properties
   REACT_APP_FALLBACK_STREAM_URL="https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
   ```

## Getting Support

If issues persist after following this guide:

1. Check Google Cloud Console for more detailed error information
2. Contact the ICTG development team for assistance
3. Consider upgrading to a higher YouTube API quota tier if needed

Remember to always test in development before deploying changes to production.
