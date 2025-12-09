# YouTube API Key Creation Guide for ICTG Live Service

The current YouTube API key (configured via `REACT_APP_YOUTUBE_API_KEY`) is returning 403 Forbidden errors, which indicates it doesn't have proper permissions or has been restricted. Follow these steps to create a new API key and update the application:

## Step 1: Access Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account (use the ICTG organization account if available)

## Step 2: Create or Select a Project

1. From the dropdown at the top of the page, select an existing project or create a new one
2. If creating a new project:
   - Click "New Project"
   - Enter a project name (e.g., "ICTG Live Service")
   - Click "Create"

## Step 3: Enable YouTube Data API v3

1. From the navigation menu, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it and then click "Enable"
4. Wait for the API to be enabled

## Step 4: Create API Key

1. From the navigation menu, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" and select "API key"
3. A new API key will be created and displayed
4. Copy the API key immediately (you won't be able to view it again)

## Step 5: Restrict API Key (Required for Security)

1. After creating the key, click "Restrict Key"
2. Under "API restrictions", select "Restrict key"
3. Select "YouTube Data API v3" from the dropdown
4. Click "Save"

## Step 6: Update Your Application

1. Open your `.env` file in the project root directory (`c:\Users\timmy\OneDrive\Documents\JS Essential\ictgapi\.env`)
2. Replace the value for `REACT_APP_YOUTUBE_API_KEY` with your new API key:

   ```properties
   REACT_APP_YOUTUBE_API_KEY="YOUR_NEW_API_KEY_HERE"
   ```

3. Save the file and restart your application

## Step 7: Test Your Integration

1. Run your application and navigate to the Live Service page
2. Open the browser's developer console (F12) to check for any API-related errors
3. Verify that:
   - The YouTube channel live status is being checked correctly
   - If a live stream is available, it displays properly
   - The viewer count updates correctly

## Fixing Common YouTube API Issues

If you continue to experience 403 Forbidden errors:

1. **Enable Billing (Important!):**
   - YouTube Data API requires an active billing account even for free quota
   - Go to "Billing" in Google Cloud Console
   - Link a payment method (you likely won't be charged unless you exceed free quotas)

2. **Check API Quotas**:
   - Go to "APIs & Services" > "Dashboard" > "YouTube Data API v3" > "Quotas"
   - The free tier includes 10,000 units per day
   - Our app typically uses:
     - ~100 units for each channel live check
     - ~3 units for each viewer count check
   - If you're exceeding quotas, consider reducing polling frequency

3. **Check API Restrictions**:
   - Make sure the API key doesn't have restrictive referrer or IP address limitations
   - For testing locally, you might need to allow localhost

4. **Verify Channel ID**:
   - Confirm that the channel ID in `.env` (`UCyUKtrMdDilf74SPkCCKKtw`) is correct
   - This should match the ID of the YouTube channel you're monitoring

## YouTube API Endpoints Used

Our application uses the following YouTube API endpoints:

1. **Search for live broadcasts**:

   ```http
   https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=[CHANNEL_ID]&eventType=live&type=video&key=[API_KEY]
   ```

2. **Get video details including viewer count**:

   ```http
   https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=[VIDEO_ID]&key=[API_KEY]
   ```

For more detailed information, see the [YouTube Data API documentation](https://developers.google.com/youtube/v3/getting-started).

## Project-Specific Information

- **Channel ID**: `UCyUKtrMdDilf74SPkCCKKtw` (Winners Chapel)
- **API Key Environment Variable**: `REACT_APP_YOUTUBE_API_KEY`
- **Service Files**:
  - `src/services/YouTubeService.js` - Main YouTube API interaction
  - `src/services/LivestreamService.js` - Backend livestream status updates
  - `src/Components/LiveService.js` - Frontend component using these services

## Support

If you need assistance with API setup, contact the ICTG development team lead.
