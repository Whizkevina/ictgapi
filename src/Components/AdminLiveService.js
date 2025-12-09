import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import background from './imagee.jpg';
import Navigation from "./Navigation";
import Footer from "./Footer";
import Card from "./Card";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import { config } from '../config/config';
import { handleApiError } from '../utils/helpers';
import { copyTextToClipboard } from '../utils/clipboard';
import { buildLivestreamPayload, normalizeLivestreamUrl, getVideoIdFromUrl, buildManualInstructions } from '../utils/livestreamAdmin';

import ErrorBoundary from './ErrorBoundary';

const AdminLiveService = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [apiErrorDetails, setApiErrorDetails] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    LiveStreamUrl: '',
    LiveStreamTitle: ''
  });

  // API settings
  const apiBaseUrl = config.api.baseUrl;
  const livestreamEndpoint = config.api.endpoints.livestream;
  const updateEndpoint = config.api.endpoints.updateLivestream || livestreamEndpoint;
  const getUrl = `${apiBaseUrl}${livestreamEndpoint}`;
  const updateUrl = `${apiBaseUrl}${updateEndpoint}`;
  const youtubeChannelIdDisplay = config.stream.youtubeChannelId || '[Set via REACT_APP_YOUTUBE_CHANNEL_ID]';

  // Authentication + admin configuration sourced from environment
  const authToken = config.admin.authToken;
  const adminPasswordFromConfig = config.admin.password;
  
  // Log the endpoint we're using for debugging
  console.log("Using GET endpoint:", getUrl);
  console.log("Using UPDATE endpoint:", updateUrl);

  useEffect(() => {
    // Fetch current data on initial load
    const fetchCurrentData = async () => {
      if (!authToken) {
        setErrorMessage('Admin auth token is not configured. Please update your environment variables.');
        setIsLoading(false);
        return;
      }

      try {
        // Add authentication headers for GET request
        const response = await fetch(getUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': authToken
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text().catch(() => 'No error details');
          console.error('Server response on GET:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API response data:', data);
        
        setFormData({
          LiveStreamUrl: data.LiveStreamUrl || '',
          LiveStreamTitle: data.LiveStreamTitle || ''
        });
      } catch (error) {
        console.error('Error fetching current live service data:', error);
        setErrorMessage(handleApiError(error, 'fetching live service data'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentData();
  }, [getUrl, authToken]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password authentication
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (!adminPasswordFromConfig) {
      setErrorMessage('Admin password is not configured. Please contact the site administrator.');
      return;
    }

    if (adminPassword === adminPasswordFromConfig) {
      setIsAuthorized(true);
      setErrorMessage('');
    } else {
      setErrorMessage('Invalid password. Access denied.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMessage('');
    setErrorMessage('');
    setApiErrorDetails('');

    const normalizedLiveStreamUrl = normalizeLivestreamUrl(formData.LiveStreamUrl);
    const payload = buildLivestreamPayload({
      ...formData,
      LiveStreamUrl: normalizedLiveStreamUrl
    });

    try {
      if (!authToken) {
        setErrorMessage('Admin auth token is not configured. Please update your environment variables.');
        return;
      }

      // CORS WORKAROUND - If the API doesn't allow direct requests from the browser
      // Uncomment the next line and comment out the fetch code block to use this approach
      /*
      // Open a new tab with Postman link - this is a workaround if the API has CORS restrictions
      const encodedPayload = encodeURIComponent(JSON.stringify({
        LiveStreamUrl: processedUrl, 
        LiveStreamTitle: formData.LiveStreamTitle
      }));
      window.open(`https://postman.com/run-collection?data=${encodedPayload}&endpoint=${updateUrl}`);
      setSuccessMessage('Opened Postman link to complete the update. Please follow instructions there.');
      setIsSaving(false);
      return;
      */
      
      // Inspect request structure - based on your server's expectations
      // The actual data structure may need to be adjusted
      // Create a complete payload with all expected fields from the API
      console.log('Sending data:', payload);
      
      // Use PUT method as required by the API
      console.log(`Making PUT request to ${updateUrl}`);
      let response;
      
      // Use PUT method directly since the endpoint requires it
      response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify(payload)
      });
      
      console.log('PUT response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error('Server response:', errorText);
        
        // Store the API error message for display
        const apiErrorMessage = errorText && typeof errorText === 'string' ? errorText : 'No detailed error message available';
        
        // Add the API error message to the component state for display
        setErrorMessage(`Error ${response.status}: ${apiErrorMessage}`);
        setApiErrorDetails(apiErrorMessage);
        
        // If we're getting 404 errors or other issues, offer a manual update option
        const shouldOpenPostman = window.confirm(
          `Error ${response.status} updating through API: ${apiErrorMessage}\n\nWould you like to open Postman to perform the update manually?`
        );
        
        if (shouldOpenPostman) {
          // Provide a way for the user to manually update via Postman
          // Create a prefilled Postman collection with the current values
          // We're using a base64 encoded Postman collection JSON that has placeholders
          const postmanCollection = {
            info: {
              name: "Update Live Service",
              schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: [{
              name: "Update Live Stream",
              request: {
                method: "PUT",
                header: [
                  {key: "Content-Type", value: "application/json"},
                  {key: "x-auth-token", value: authToken}
                ],
                body: {
                  mode: "raw",
                  raw: JSON.stringify({
                    LiveStreamUrl: payload.LiveStreamUrl,
                    LiveStreamTitle: formData.LiveStreamTitle
                  }, null, 4)
                },
                url: {
                  raw: updateUrl
                }
              }
            }]
          };
          
          const encodedCollection = btoa(JSON.stringify(postmanCollection));
          const postmanUrl = `https://www.postman.com/collections/import?input=${encodedCollection}`;
          
          window.open(postmanUrl, '_blank');
          setSuccessMessage('Opened Postman to complete the update manually.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        setSuccessMessage('Live service details updated successfully!');
        
        // Log the success
        console.log('Update successful:', payload);
      }
    } catch (error) {
      console.error('Error updating live service:', error);
      
      // Display a user-friendly error message
      if (error.message.includes('404')) {
        setErrorMessage(`Failed to update: The API endpoint (${updateUrl}) was not found (404). 
          The correct endpoint might be different from what's configured. 
          Try using the "Show Manual Instructions" button and update via Postman.`);
      } else if (error.message.includes('403')) {
        setErrorMessage('Failed to update: You do not have permission (403 Forbidden). Please check your authentication token.');
      } else if (error.message.includes('400')) {
        setErrorMessage(`Failed to update: The API rejected the request (400 Bad Request).
          This usually means the request is missing required fields or has incorrect data formats.
          Check the browser console for specific field requirements.`);
      } else if (error.message.includes('CORS')) {
        setErrorMessage(`CORS error: The server is blocking cross-origin requests. 
          Please use the "Show Manual Instructions" button and update via Postman or another API client.`);
      } else {
        setErrorMessage(`Failed to update: ${error.message}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleManualInstructionsClick = async () => {
    const normalizedUrl = normalizeLivestreamUrl(formData.LiveStreamUrl);
    const payloadForManual = buildLivestreamPayload({
      ...formData,
      LiveStreamUrl: normalizedUrl
    });

    const fallbackEndpoints = [
      `${apiBaseUrl}/Dashboard/togglelivestreamstate`,
      `${apiBaseUrl}/Dashboard/update-livestream`
    ];

    const manualInstructions = buildManualInstructions({
      payload: payloadForManual,
      updateUrl,
      authToken,
      fallbackEndpoints
    });

    try {
      await copyTextToClipboard(manualInstructions);
      alert(`${manualInstructions}\n\n(Instructions copied to clipboard!)`);
    } catch (clipboardError) {
      console.error('Unable to copy manual instructions to clipboard.', clipboardError);
      alert(`${manualInstructions}\n\n(Could not copy automatically. Please copy the text manually.)`);
    }
  };

  // Extract video ID from URL for preview
  const videoId = getVideoIdFromUrl(formData.LiveStreamUrl);

  return (
    <ErrorBoundary>
      <div 
        className="page-container relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background})` }}
      >
      <div className="background-overlay absolute inset-0 bg-black bg-opacity-70"></div>
      <Navigation />
      
      <div className="relative z-10 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-white mb-8">
            Live Service Admin Panel
          </h1>
          
          {isLoading ? (
            <Card variant="default" className="max-w-2xl mx-auto p-6">
              <LoadingSpinner text="Loading current data..." />
            </Card>
          ) : !isAuthorized ? (
            <Card variant="dark" className="max-w-md mx-auto p-6 border border-gray-300">
              <h2 className="text-2xl font-bold mb-4 text-white">Admin Access</h2>
              <p className="text-gray-300 mb-4">Please enter the admin password to continue.</p>
              
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {errorMessage}
                </div>
              )}
              
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-1">
                    Admin Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-medium"
                    required
                  />
                </div>
                
                <Button 
                  type="submit"
                  variant="primary"
                  className="w-full"
                >
                  Login
                </Button>
                
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate('/LiveService')}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Return to Live Service
                  </button>
                </div>
              </form>
            </Card>
          ) : (
            <Card variant="dark" className="max-w-4xl mx-auto p-6 bg-opacity-95 border border-gray-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white bg-church-maroon px-4 py-2 rounded-lg shadow">Update Live Service</h2>
                <button
                  onClick={() => navigate('/LiveService')}
                  className="text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow transition-all duration-200"
                >
                  View Live Page
                </button>
              </div>
              
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {successMessage}
                </div>
              )}
              
              {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="font-bold">Error:</p>
                  <p>{errorMessage}</p>
                  <p className="text-sm mt-2">
                    This may be due to a CORS issue or incorrect endpoint configuration. 
                    Check the browser console for more details.
                  </p>
                  {errorMessage.includes('404') && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                      <p className="text-yellow-800 font-bold">Troubleshooting 404 Errors:</p>
                      <ol className="list-decimal ml-5 text-yellow-800 text-sm">
                        <li>The endpoint URL might be incorrect - try using "Show Manual Instructions" and test with Postman</li>
                        <li>The API might require different authentication or payload format</li>
                        <li>The server might be configured to only accept requests from specific sources (CORS issue)</li>
                      </ol>
                    </div>
                  )}
                  
                  {errorMessage.includes('400') && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded">
                      <p className="text-yellow-800 font-bold">Troubleshooting 400 Bad Request Errors:</p>
                      <p className="text-yellow-800 text-sm mt-1 mb-2">API Error Message: <span className="font-mono bg-yellow-100 px-2 py-1 rounded">{apiErrorDetails}</span></p>
                      <ol className="list-decimal ml-5 text-yellow-800 text-sm">
                        <li>The API requires specific fields that might be missing from the request</li>
                        <li>The data format or values might not match what the API expects</li>
                        <li>Try including additional fields in the request based on the error message</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Live Stream URL Input */}
                <div>
                  <label htmlFor="LiveStreamUrl" className="block text-sm font-medium text-white mb-1">
                    Live Stream URL (YouTube)
                  </label>
                  <input
                    type="url"
                    id="LiveStreamUrl"
                    name="LiveStreamUrl"
                    value={formData.LiveStreamUrl}
                    onChange={handleInputChange}
                    placeholder="https://youtu.be/video-id"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-medium"
                    required
                  />
                  <p className="text-xs text-gray-300 mt-1">
                    Enter a YouTube video URL (standard or short format)
                  </p>
                </div>

                {/* Video Preview */}
                {videoId && (
                  <div className="border border-gray-300 rounded-lg p-4 bg-white shadow-inner">
                    <p className="text-sm font-bold text-gray-800 mb-2">Video Preview:</p>
                    <div className="aspect-w-16 aspect-h-9">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title="YouTube video preview"
                        className="w-full h-64 rounded shadow-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  </div>
                )}

                {/* Live Stream Title Input */}
                <div>
                  <label htmlFor="LiveStreamTitle" className="block text-sm font-medium text-white mb-1">
                    Live Stream Title
                  </label>
                  <input
                    type="text"
                    id="LiveStreamTitle"
                    name="LiveStreamTitle"
                    value={formData.LiveStreamTitle}
                    onChange={handleInputChange}
                    placeholder="Enter the title of the live stream"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-medium"
                    required
                  />
                </div>
                
                {/* Additional required fields section */}
                <div className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <h3 className="text-lg font-bold text-blue-800 mb-3">Required API Fields</h3>
                  <p className="text-sm text-blue-700 mb-3">These fields are required by the API and will be included in the request</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="AppVersion" className="block text-sm font-medium text-gray-700 mb-1">
                        App Version
                      </label>
                      <input
                        type="text"
                        id="AppVersion"
                        name="AppVersion"
                        value="1.30"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black-700"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="OnlineGivingUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Online Giving URL
                      </label>
                      <input
                        type="text"
                        id="OnlineGivingUrl"
                        name="OnlineGivingUrl"
                        value="https://give.domi.org.ng"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="DomiRadio" className="block text-sm font-medium text-gray-700 mb-1">
                        Domi Radio URL
                      </label>
                      <input
                        type="text"
                        id="DomiRadio"
                        name="DomiRadio"
                        value="https://streams.domimedia.org/domi_radio_english/live.m3u8"
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black-700"
                      />
                    </div>
                  </div>
                  
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-700 font-medium">View all 16 API fields</summary>
                    <div className="mt-3 p-3 bg-black rounded border border-blue-100 text-xs font-mono">
                      <pre className="whitespace-pre-wrap overflow-auto max-h-48">
{`{
  "AppVersion": "1.30",
  "ForceUpdate": false,
  "EnableGeoLocation": true,
  "EnableGiving": true,
  "IncrementOnlineUsers": true,
  "OnlineUsersCount": 0,
  "TestimoniesPlaceholder": "...",
  "AnnouncementsPlaceholder": "...",
  "PrivacyPolicyUrl": "https://wwma-privacy.netlify.app/",
  "OnlineGivingUrl": "https://give.domi.org.ng",
  "DownloadsUrl": "https://faithtabernacle.org.ng/downloads",
  "OnlineBookStoreUrl": "https://domionlinestore.org",
  "DomiRadio": "https://streams.domimedia.org/domi_radio_english/live.m3u8",
  "LiveStreamUrl": "${formData.LiveStreamUrl}",
  "LiveStreamTitle": "${formData.LiveStreamTitle}",
  "YouTubeClannelID": "${youtubeChannelIdDisplay}",
  "YouTubeApiKey": "${youtubeApiKeyDisplay}"
}`}
                      </pre>
                    </div>
                  </details>
                  
                  <p className="text-xs text-blue-600 mt-2">
                    Note: All these fields are included automatically in each request.
                  </p>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isSaving}
                    onClick={handleManualInstructionsClick}
                  >
                    Show Manual Instructions
                  </Button>
                  
                  <Button
                    type="submit"
                    variant="success"
                    disabled={isSaving}
                    className="px-6 py-2"
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Updating...
                      </span>
                    ) : (
                      'Update Live Service'
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
    </ErrorBoundary>
  );
};

export default AdminLiveService;
