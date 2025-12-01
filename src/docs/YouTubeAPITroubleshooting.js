/**
 * Troubleshooting Guide for LiveService YouTube Integration
 * 
 * Current Issue: 403 Forbidden error when accessing YouTube API
 * 
 * Problem:
 * The YouTube API key configured via REACT_APP_YOUTUBE_API_KEY is receiving a 403 Forbidden
 * response when attempting to access the YouTube Data API. This indicates an authentication or permission issue.
 * 
 * Possible causes:
 * 
 * 1. API Key Restrictions:
 *    - The API key might be restricted to specific domains or IP addresses that don't match where the app is running
 *    - API key might have expired or been revoked
 *    - API key might be over its quota limits
 * 
 * 2. API Access:
 *    - The YouTube Data API might not be enabled for this API key
 *    - The specific endpoints being used might be restricted
 * 
 * Troubleshooting steps:
 * 
 * 1. Check API key in Google Cloud Console:
 *    - Go to https://console.cloud.google.com
 *    - Navigate to the project that contains the API key
 *    - Go to "APIs & Services" > "Credentials"
 *    - Find the API key and check its restrictions
 * 
 * 2. Verify API is enabled:
 *    - In Google Cloud Console, go to "APIs & Services" > "Library"
 *    - Search for "YouTube Data API v3"
 *    - Ensure it's enabled for the project
 * 
 * 3. Check quotas:
 *    - In Google Cloud Console, go to "APIs & Services" > "Dashboard"
 *    - Look for any quota warnings related to YouTube Data API
 * 
 * 4. Create a new API key:
 *    - If necessary, create a new unrestricted API key for testing
 *    - Update the REACT_APP_YOUTUBE_API_KEY value in .env file
 *
 * Current Implementation:
 * - The app has been modified to gracefully handle 403 errors
 * - It will not get stuck loading when YouTube API access fails
 * - It falls back to using the church's API data when available
 * - Clear error message is shown to users
 * 
 * For further assistance:
 * 1. Check Google Cloud Console documentation on API keys
 * 2. YouTube Data API documentation on API key requirements
 * 3. Contact Google Cloud Support if the issue persists
 */
