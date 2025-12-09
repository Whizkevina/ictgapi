import background from './imagee.jpg';
import Navigation from "./Navigation";
import Footer from "./Footer";
import Card from "./Card";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import React, {useEffect, useState, useCallback, useRef} from 'react';
import ReactPlayer from 'react-player';
import config from '../config/config';
import { handleApiError, isValidVideoUrl, getUserPreference, setUserPreference } from '../utils/helpers';
// Temporarily disabled - will be used when we get API keys
// import transcriptionService from '../services/TranscriptionService';

const LIVE_PAYLOAD_CACHE_KEY = 'ictg_live_payload_v1';
const LIVE_PAYLOAD_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const VIEWER_COUNT_CACHE_KEY = 'ictg_viewer_count_v1';
const VIEWER_ZERO_RESET_DELAY_MS = 60 * 1000; // 1 minute grace before dropping to zero

const LiveService = () => {
    const [info, setInfo] = useState({});
    const [viewerCount, setViewerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLive, setIsLive] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState('default');
    const [showNotificationModal, setShowNotificationModal] = useState(false);
    const notificationModalRef = useRef(null);
    const prevIsLiveRef = useRef(false);
    const hydratedFromCacheRef = useRef(false);
    const lastStableViewerRef = useRef(0);
    const pendingZeroResetRef = useRef(null);
    const canUseNativeNotifications = typeof window !== 'undefined' && 'Notification' in window;

    const persistPayloadCache = useCallback((payload) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(
          LIVE_PAYLOAD_CACHE_KEY,
          JSON.stringify({ data: payload, timestamp: Date.now() })
        );
      } catch (storageError) {
        console.warn('Unable to cache live payload:', storageError);
      }
    }, []);

    const persistViewerCountCache = useCallback((count) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(
          VIEWER_COUNT_CACHE_KEY,
          JSON.stringify({ count, timestamp: Date.now() })
        );
      } catch (storageError) {
        console.warn('Unable to cache viewer count:', storageError);
      }
    }, []);

    const applyViewerCount = useCallback((rawCount, { allowImmediateZero = false } = {}) => {
      const parsedCount = Number.isFinite(rawCount) ? rawCount : 0;

      if (parsedCount > 0) {
        if (pendingZeroResetRef.current) {
          clearTimeout(pendingZeroResetRef.current);
          pendingZeroResetRef.current = null;
        }
        lastStableViewerRef.current = parsedCount;
        setViewerCount(parsedCount);
        persistViewerCountCache(parsedCount);
        return parsedCount;
      }

      if (allowImmediateZero || lastStableViewerRef.current === 0) {
        if (pendingZeroResetRef.current) {
          clearTimeout(pendingZeroResetRef.current);
          pendingZeroResetRef.current = null;
        }
        lastStableViewerRef.current = 0;
        setViewerCount(0);
        persistViewerCountCache(0);
        return 0;
      }

      if (!pendingZeroResetRef.current) {
        pendingZeroResetRef.current = setTimeout(() => {
          lastStableViewerRef.current = 0;
          setViewerCount(0);
          persistViewerCountCache(0);
          pendingZeroResetRef.current = null;
        }, VIEWER_ZERO_RESET_DELAY_MS);
      }

      return lastStableViewerRef.current;
    }, [persistViewerCountCache]);
    
    // Service notes can come from predefined data or AI transcription - TEMPORARILY DISABLED
    /* To be enabled when we get API keys for AI transcription
    const [serviceNotes, setServiceNotes] = useState({
        scriptures: [
            { type: 'Main', reference: 'John 3:16-21', excerpt: 'For God so loved the world...' },
            { type: 'Add.', reference: 'Romans 8:28-39', excerpt: 'And we know that in all things God works...' }
        ],
        sermonPoints: [
            'God\'s unconditional love is the foundation of our faith',
            'Salvation comes through faith in Christ',
            'God\'s grace is sufficient for all our needs'
        ],
        resources: [
            { name: 'Sermon Outline (PDF)', type: 'pdf', url: '#' },
            { name: 'Worship Session Video', type: 'video', url: '#' }
        ]
    });
    
    // AI Transcription states - TEMPORARILY DISABLED
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionEnabled, setTranscriptionEnabled] = useState(false);
    const [transcript, setTranscript] = useState('');
    */
    
    // Use configuration for API settings
    const apiBaseUrl = config.api.baseUrl;
    const livestreamEndpoint = config.api.endpoints.livestream;
    // Short interval (30 seconds) just for viewer count
    const viewerCountInterval = 30000;
    const url = `${apiBaseUrl}${livestreamEndpoint}`;

    // Track livestream status directly from backend info payload
    useEffect(() => {
      const hasValidStream = !loading && info.LiveStreamUrl && isValidVideoUrl(info.LiveStreamUrl);
      setIsLive(hasValidStream);
    }, [loading, info.LiveStreamUrl]);

    // Hydrate from cached payload so the UI isn't blank while waiting for the network
    useEffect(() => {
      if (typeof window === 'undefined') return;
      try {
        const cachedPayloadRaw = window.localStorage.getItem(LIVE_PAYLOAD_CACHE_KEY);
        if (cachedPayloadRaw) {
          const cachedPayload = JSON.parse(cachedPayloadRaw);
          const payloadIsFresh = cachedPayload?.timestamp && (Date.now() - cachedPayload.timestamp) < LIVE_PAYLOAD_CACHE_TTL_MS;
          if (cachedPayload?.data && payloadIsFresh) {
            hydratedFromCacheRef.current = true;
            setInfo(cachedPayload.data);
            applyViewerCount(cachedPayload.data.OnlineUsersCount || 0, { allowImmediateZero: true });
            setLoading(false);
            return;
          }
          window.localStorage.removeItem(LIVE_PAYLOAD_CACHE_KEY);
        }
        const cachedViewerRaw = window.localStorage.getItem(VIEWER_COUNT_CACHE_KEY);
        if (cachedViewerRaw) {
          const cachedViewer = JSON.parse(cachedViewerRaw);
          const viewerIsFresh = cachedViewer?.timestamp && (Date.now() - cachedViewer.timestamp) < LIVE_PAYLOAD_CACHE_TTL_MS;
          if (viewerIsFresh && Number.isFinite(cachedViewer?.count)) {
            applyViewerCount(cachedViewer.count, { allowImmediateZero: true });
          } else {
            window.localStorage.removeItem(VIEWER_COUNT_CACHE_KEY);
          }
        }
      } catch (cacheError) {
        console.warn('Unable to hydrate live service cache:', cacheError);
      }
    }, [applyViewerCount]);

  // Main data fetching function wrapped in useCallback
  const fetchData = useCallback(async (updateViewerCountOnly = false, options = {}) => {
    const { skipLoadingState = false } = options;
    const shouldToggleLoading = !updateViewerCountOnly && !skipLoadingState;
    try {
      if (shouldToggleLoading) {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (updateViewerCountOnly) {
        // Only update the viewer count
        applyViewerCount(data.OnlineUsersCount || 0);
      } else {
        // Update all data and set initial viewer count
        setInfo(data);
        applyViewerCount(data.OnlineUsersCount || 0, { allowImmediateZero: true });
        persistPayloadCache(data);
      }
    } catch (error) {
        console.error('Error fetching live service data:', error);
        if (!updateViewerCountOnly) {
          setError(handleApiError(error, 'fetching live service data'));
        }
    } finally {
      if (shouldToggleLoading) {
        setLoading(false);
      }
    }
  }, [url, applyViewerCount, persistPayloadCache]);

  // Main content refresh effect - only does initial load, no polling
  useEffect(() => {
    fetchData(false, { skipLoadingState: hydratedFromCacheRef.current });
    // No interval for main content - we only need to load it once
    // This avoids unnecessary refreshes since only the viewer count needs to be dynamic
  }, [fetchData]); // Include all dependencies
    
    // Function to handle copying service info to clipboard
    const copyServiceInfo = () => {
      // Get the current date formatted as requested
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      // Get the service title from info or use a default
      const serviceTitle = info.LiveStreamTitle || 'Live Service';
      
      // Format the text using the dynamic service information
      const textToCopy = `SERVICE TITLE: ${serviceTitle} | ${formattedDate}\n`
        + `ONLINE WORSHIPPERS COUNT: ${viewerCount}`;
      
      // Copy to clipboard
      navigator.clipboard.writeText(textToCopy);
      
      // Show the tooltip for feedback
      const tooltip = document.getElementById('copy-tooltip');
      tooltip.classList.remove('opacity-0');
      tooltip.classList.add('opacity-100');
      setTimeout(() => {
        tooltip.classList.remove('opacity-100');
        tooltip.classList.add('opacity-0');
      }, 2000);
    };

    // Format elapsed time into a readable format (HH:MM:SS)
    const formatElapsedTime = (seconds) => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
      
      return [
        hours > 0 ? hours.toString().padStart(2, '0') : null, 
        minutes.toString().padStart(2, '0'), 
        secs.toString().padStart(2, '0')
      ].filter(Boolean).join(':');
    };

  

  // Separate effect for viewer count updates
  useEffect(() => {
    // Don't start viewer count polling until main data is loaded
    if (loading) return;
    
    // Set up more frequent polling just for viewer count
    const countInterval = setInterval(() => fetchData(true), viewerCountInterval);
    
    return () => clearInterval(countInterval);
  }, [loading, viewerCountInterval, fetchData]);

  // Clean up any pending viewer-count reset timers on unmount
  useEffect(() => () => {
    if (pendingZeroResetRef.current) {
      clearTimeout(pendingZeroResetRef.current);
    }
  }, []);
  
  // Effect for the live timer
  useEffect(() => {
    // Only start timer if we're live
    if (isLive) {
      // Timer logic
      const timerInterval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timerInterval);
    } else {
      setElapsedTime(0);
    }
  }, [isLive]);
    
    // Set up AI transcription service - TEMPORARILY DISABLED
    /* Commented out until we have API keys for transcription
    useEffect(() => {
      // Register for updates from the transcription service
      const updateHandler = (data) => {
        setIsTranscribing(data.isActive);
        setTranscript(data.transcript);
        
        // Update service notes with detected scriptures and sermon points
        setServiceNotes(prevNotes => {
          return {
            ...prevNotes,
            // Merge AI-detected scriptures with any existing ones
            scriptures: data.scriptures.length > 0 ? data.scriptures : prevNotes.scriptures,
            // Merge AI-detected sermon points with any existing ones
            sermonPoints: data.sermonPoints.length > 0 ? data.sermonPoints : prevNotes.sermonPoints,
          };
        });
      };
      
      transcriptionService.onUpdate(updateHandler);
      
      // Clean up
      return () => {
        transcriptionService.stopTranscription();
      };
    }, []);
    
    // Start/stop transcription when the feature is toggled or the stream changes
    useEffect(() => {
      if (transcriptionEnabled && isLive && info.LiveStreamUrl) {
        transcriptionService.startTranscription(info.LiveStreamUrl);
      } else if (!transcriptionEnabled && isTranscribing) {
        transcriptionService.stopTranscription();
      }
    }, [transcriptionEnabled, isLive, info.LiveStreamUrl, isTranscribing]);
    */
    
    // Toggle AI transcription - TEMPORARILY DISABLED
    /* Commented out until we have API keys for transcription
    const toggleTranscription = () => {
      const newState = !transcriptionEnabled;
      setTranscriptionEnabled(newState);
      
      if (newState) {
        if (isLive && info.LiveStreamUrl) {
          transcriptionService.startTranscription(info.LiveStreamUrl);
        }
      } else {
        transcriptionService.stopTranscription();
      }
    };
    */
    
    // Effect for initializing notification preferences
    useEffect(() => {
      // Check notification permission on component mount
      if (canUseNativeNotifications) {
        setNotificationPermission(Notification.permission);
        // Load user preference from localStorage
        const savedPreference = getUserPreference('notifications_enabled', false);
        setNotificationsEnabled(savedPreference && Notification.permission === 'granted');
      } else {
        setNotificationPermission('denied');
        setNotificationsEnabled(false);
      }
      
      // Handle click outside notification modal
      const handleClickOutside = (event) => {
        if (notificationModalRef.current && !notificationModalRef.current.contains(event.target)) {
          setShowNotificationModal(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [canUseNativeNotifications]);
    
    const showNativeNotification = useCallback((title, options = {}) => {
      if (!canUseNativeNotifications) {
        // Fallback for devices/browsers without Notification API support
        console.warn('Notification API is not supported in this browser.');
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(`${title}\n\n${options.body || ''}`.trim());
        }
        return;
      }
      if (notificationPermission !== 'granted') {
        return;
      }
      try {
        new Notification(title, options);
      } catch (notifyError) {
        console.error('Unable to show notification:', notifyError);
      }
    }, [canUseNativeNotifications, notificationPermission]);

    // Function to request notification permission
    const requestNotificationPermission = async () => {
      if (!canUseNativeNotifications) {
        alert('This device does not support push notifications.');
        setShowNotificationModal(false);
        return;
      }
      try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
        
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          setUserPreference('notifications_enabled', true);
          // Show success notification
          showNativeNotification('Notifications Enabled', {
            body: 'You will be notified when live services begin.',
            icon: '/favicon.ico'
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
      setShowNotificationModal(false);
    };
    
    // Function to toggle notifications
    const toggleNotifications = () => {
      if (!canUseNativeNotifications) {
        alert('Notifications are not supported on this device or browser.');
        return;
      }
      if (notificationPermission !== 'granted') {
        // Show the notification permission modal
        setShowNotificationModal(true);
      } else {
        // Toggle the notification setting
        const newValue = !notificationsEnabled;
        setNotificationsEnabled(newValue);
        setUserPreference('notifications_enabled', newValue);
        
        if (newValue) {
          // Show success notification
          showNativeNotification('Notifications Enabled', {
            body: 'You will be notified when live services begin.',
            icon: '/favicon.ico'
          });
        }
      }
    };

    // Notify user automatically when stream goes live
    useEffect(() => {
      if (!notificationsEnabled || notificationPermission !== 'granted') {
        prevIsLiveRef.current = isLive;
        return;
      }
      if (isLive && !prevIsLiveRef.current) {
        const title = info.LiveStreamTitle || 'Live Service Started';
        showNativeNotification(title, {
          body: 'Join the live worship experience now.',
          icon: '/favicon.ico',
          tag: 'live-service-start'
        });
      }
      if (!isLive && prevIsLiveRef.current) {
        showNativeNotification('Live Service Ended', {
          body: 'The live stream has concluded. Thank you for worshipping with us.',
          icon: '/favicon.ico',
          tag: 'live-service-end'
        });
      }
      prevIsLiveRef.current = isLive;
    }, [isLive, notificationsEnabled, notificationPermission, info.LiveStreamTitle, showNativeNotification]);


    return (
       <div 
         className="page-container relative bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: `url(${background})` }}
       >
        <div className="background-overlay"></div>
        <Navigation />
        
        <div className="relative z-10 flex-1 py-8">
          <div className="max-w-6xl mx-auto px-4">
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center min-h-[400px]">
                <LoadingSpinner size="lg" text="🔄 Loading live service..." />
              </div>
            )}
            
            {/* Error State */}
            {error && (
              <div className="flex justify-center items-center min-h-[400px]">
                <Card variant="default" className="p-8 max-w-md mx-auto text-center">
                  <div className="text-red-500 text-4xl mb-4">⚠️</div>
                  <p className="text-red-600 font-semibold mb-4">{error}</p>
                  <Button 
                    variant="primary"
                    icon="🔄"
                    onClick={() => window.location.reload()}
                  >
                    Try Again
                  </Button>
                </Card>
              </div>
            )}
            
            {/* Video Player */}
            {!loading && !error && info.LiveStreamUrl && isValidVideoUrl(info.LiveStreamUrl) && (
              <div className="space-y-6 animate-fade-in">
                <div className="video-responsive">
                  <ReactPlayer 
                    url={info.LiveStreamUrl} 
                    width="100%" 
                    height="100%"
                    controls
                    playing
                    className="rounded-lg shadow-2xl"
                  />
                </div>
                
                {/* Service Information Cards */}
                <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-3xl">📺</span>
                      <div>
                        <p className="text-sm text-gray-300">Service Title</p>
                        <p className="font-bold text-lg">
                          {info.LiveStreamTitle || 'Live Service'}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  <Card variant="glass" className="p-6">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="text-3xl">👥</span>
                      <div className="flex-grow">
                        <p className="text-sm text-gray-300">Online Worshippers</p>
                        <div className="flex items-center">
                          <p className="font-bold text-2xl text-church-gold">
                            {viewerCount || '0'}
                          </p>
                          <div className="group relative">
                            <button 
                              onClick={copyServiceInfo}
                              className="ml-3 py-1.5 px-3 flex items-center text-xs font-medium bg-church-gold/30 hover:bg-church-gold/50 text-church-gold rounded-md transition-colors shadow-sm"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                              Copy Service Info
                            </button>
                            
                            {/* Hover preview */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-black/90 text-white text-xs p-2 rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-20">
                              <div className="font-medium text-church-gold mb-1">Preview of copied content:</div>
                              <div className="text-white/80 text-[10px] whitespace-pre-wrap">
                                SERVICE TITLE: {info.LiveStreamTitle || 'Live Service'} | {new Date().toLocaleDateString('en-US', {day: 'numeric', month: 'long', year: 'numeric'})}
                                
                                ONLINE WORSHIPPERS COUNT: {viewerCount}
                              </div>
                              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-black/90"></div>
                            </div>
                          </div>
                          <div id="copy-tooltip" className="ml-2 bg-black/90 text-white text-xs px-3 py-1.5 rounded shadow-lg opacity-0 transition-opacity duration-300">
                            Service info copied to clipboard!
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                
                {/* Service Notes & Resources Section - TEMPORARILY DISABLED
                  The AI-powered service notes, transcription, and resources section has been temporarily 
                  disabled until AI API keys are available. This section will be implemented later.
                */}
                
                {/* Live Indicator and Timer */}
                <div className="text-center flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                      isLive 
                        ? 'bg-red-600 animate-pulse-slow' 
                        : 'bg-gray-600'
                    } text-white`}>
                      <div className={`w-3 h-3 bg-white rounded-full ${isLive ? 'animate-pulse' : ''}`}></div>
                      <span className="font-semibold">{isLive ? 'LIVE NOW' : 'OFFLINE'}</span>
                    </div>
                    
                  </div>
                  
                  <div className="text-white/90 flex items-center space-x-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm">Duration: {formatElapsedTime(elapsedTime)}</span>
                  </div>
                </div>
                
                {/* Share Service Feature */}
                <div className="text-center mt-4">
                  <div className="inline-flex items-center justify-center gap-2">
                    <p className="text-white text-sm">Share this service:</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          const shareUrl = window.location.href;
                          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        title="Share on Facebook"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const shareUrl = window.location.href;
                          const text = `Watching live service: ${info.LiveStreamTitle || 'Live Worship'}`;
                          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
                        }}
                        className="p-2 bg-sky-500 text-white rounded-full hover:bg-sky-600 transition-colors"
                        title="Share on Twitter"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          const shareUrl = window.location.href;
                          navigator.clipboard.writeText(shareUrl);
                          // Show a toast or some feedback
                          const tooltip = document.getElementById('share-tooltip');
                          tooltip.classList.remove('opacity-0');
                          tooltip.classList.add('opacity-100');
                          setTimeout(() => {
                            tooltip.classList.remove('opacity-100');
                            tooltip.classList.add('opacity-0');
                          }, 2000);
                        }}
                        className="p-2 bg-gray-600 text-white rounded-full hover:bg-gray-700 transition-colors"
                        title="Copy link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/>
                          <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          if (navigator.share) {
                            navigator.share({
                              title: info.LiveStreamTitle || 'Live Worship',
                              url: window.location.href
                            }).catch(console.error);
                          } else {
                            // Fallback
                            const copyButton = document.querySelector('[title="Copy link"]');
                            if (copyButton) copyButton.click();
                          }
                        }}
                        className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                        title="Share via..."
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M13.5 1a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.499 2.499 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5zm-8.5 4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm11 5.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                        </svg>
                      </button>
                    </div>
                    <div id="share-tooltip" className="ml-2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 transition-opacity duration-300">
                      Link copied!
                    </div>
                  </div>
                </div>
                
                {/* Notification and AI Transcription Systems */}
                <div className="text-center mt-4 flex flex-wrap justify-center gap-3">
                  <button
                    onClick={toggleNotifications}
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-colors ${
                      notificationsEnabled 
                        ? 'bg-green-600 hover:bg-green-700 text-white' 
                        : 'bg-white/20 hover:bg-white/30 text-white'
                    }`}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      fill="currentColor" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                    </svg>
                    <span>
                      {notificationsEnabled ? 'Notifications On' : 'Get Notified'}
                    </span>
                  </button>
                  
                  <button
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-colors bg-gray-500/50 text-white/50 cursor-not-allowed"
                    title="Coming soon - AI transcription feature"
                    disabled
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width="16" 
                      height="16" 
                      fill="currentColor" 
                      viewBox="0 0 16 16"
                    >
                      <path d="M12.258 3h-8.51l-.083 2.46h.479c.26-1.544.758-1.783 2.693-1.845l.424-.013v7.827c0 .663-.144.82-1.3.923v.68h4.082v-.68c-1.162-.103-1.306-.26-1.306-.923V3.602l.431.013c1.934.062 2.434.301 2.693 1.846h.479L12.258 3z"/>
                    </svg>
                    <span>AI Notes (Coming Soon)</span>
                  </button>
                </div>
                
                {/* Notification Permission Modal */}
                {showNotificationModal && (
                  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div 
                      ref={notificationModalRef}
                      className="bg-white rounded-lg p-6 max-w-md mx-4 animate-fade-in"
                    >
                      <div className="text-center mb-4">
                        <div className="inline-block p-3 bg-blue-100 rounded-full mb-2">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width="32" 
                            height="32" 
                            fill="currentColor"
                            className="text-blue-600" 
                            viewBox="0 0 16 16"
                          >
                            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7 0-2.42-1.72-4.44-4.005-4.901z"/>
                          </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Enable Notifications</h3>
                      </div>
                      
                      <p className="text-gray-600 mb-4">
                        Get notified when live services begin so you never miss worship. You can turn this off anytime.
                      </p>
                      
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => setShowNotificationModal(false)}
                          className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          Not Now
                        </button>
                        <button
                          onClick={requestNotificationPermission}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Enable Notifications
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* No Stream Available */}
            {!loading && !error && (!info.LiveStreamUrl || !isValidVideoUrl(info.LiveStreamUrl)) && (
              <div className="content-center">
                <Card variant="default" className="p-8 max-w-md mx-auto text-center">
                  <div className="text-6xl mb-4">📺</div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">No Live Stream</h2>
                  <p className="text-gray-600 mb-6">
                    There's no live service streaming at the moment. Please check back later.
                  </p>
                  <Button 
                    variant="primary"
                    icon="🔄"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    Refresh
                  </Button>
                  
                  {/* Upcoming Services Preview */}
                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Upcoming Services</h3>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                          <span className="text-lg">🕊️</span>
                        </div>
                        <div className="flex-grow text-left">
                          <h4 className="font-medium">Sunday Worship Service</h4>
                          <p className="text-sm text-gray-500">Sunday, 06:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                        <div className="flex-shrink-0 bg-purple-100 rounded-full p-2">
                          <span className="text-lg">🙏</span>
                        </div>
                        <div className="flex-grow text-left">
                          <h4 className="font-medium">Midweek Service</h4>
                          <p className="text-sm text-gray-500">Wednesday, 6:00 PM</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-4">
                      * Schedule may vary. Please check church announcements for any changes.
                    </p>
                  </div>
                </Card>
              </div>
            )}
            
          </div>
        </div>
        
        <Footer />
       </div>
        
     );
}
 
export default LiveService;