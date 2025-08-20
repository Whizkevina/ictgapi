import background from './imagee.jpg';
import Navigation from "./Navigation";
import Footer from "./Footer";
import Card from "./Card";
import Button from "./Button";
import LoadingSpinner from "./LoadingSpinner";
import React, { useEffect, useState, useCallback } from 'react';
import ReactPlayer from 'react-player';
import config from '../config/config';
import { handleApiError } from '../utils/helpers';

const YouTubeService = () => {
    const [livestreams, setLivestreams] = useState([]);
    const [selectedStream, setSelectedStream] = useState(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLive, setIsLive] = useState(false);
    
    // Get YouTube API Key and Channel ID from environment variables
    const channelId = process.env.REACT_APP_YOUTUBE_CHANNEL_ID;
    const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;

    // Function to fetch YouTube livestreams and online viewer count
    const fetchYouTubeLivestreams = useCallback(async (updateViewerCountOnly = false) => {
        if (!channelId || !apiKey) {
            setError("YouTube API key or Channel ID is missing. Please check your environment variables.");
            setLoading(false);
            return;
        }
        
        if (!updateViewerCountOnly) {
            setLoading(true);
        }
        setError(null);
        
        console.log(`Attempting to fetch YouTube data with Channel ID: ${channelId}`);
        
        try {
            // First, fetch online users count from the API
            const apiBaseUrl = config.api.baseUrl;
            const livestreamEndpoint = config.api.endpoints.livestream;
            const apiUrl = `${apiBaseUrl}${livestreamEndpoint}`;
            
            try {
                const apiResponse = await fetch(apiUrl);
                if (apiResponse.ok) {
                    const apiData = await apiResponse.json();
                    if (apiData.OnlineUsersCount) {
                        // Update the viewer count with the API data
                        setViewerCount(apiData.OnlineUsersCount);
                    }
                }
            } catch (apiError) {
                console.error('Error fetching viewer count from API:', apiError);
                // Continue with YouTube data even if API fails
            }
            
            if (updateViewerCountOnly) {
                return; // Skip YouTube API calls if we're just updating viewer count
            }
            
            // Now get the YouTube channel data
            const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet,statistics&id=${channelId}&key=${apiKey}`;
            console.log(`Fetching channel data from: ${channelUrl}`);
            
            const channelResponse = await fetch(channelUrl);
            
            if (!channelResponse.ok) {
                const errorCode = channelResponse.status;
                
                // Provide specific error messages based on status code
                if (errorCode === 403) {
                    console.error("403 Forbidden - API key may be invalid or restricted");
                    throw new Error("YouTube API access denied (403 Forbidden). The API key may be invalid, restricted, or doesn't have YouTube Data API v3 enabled.");
                } else if (errorCode === 404) {
                    throw new Error(`Channel ID "${channelId}" not found. Please verify the Channel ID.`);
                } else {
                    throw new Error(`HTTP error! status: ${errorCode}`);
                }
            }
            
            const channelData = await channelResponse.json();
            
            if (!channelData.items || channelData.items.length === 0) {
                throw new Error('Channel not found');
            }
            
            // Now search for live streams from this channel
            const searchResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
            );
            
            if (!searchResponse.ok) {
                throw new Error(`HTTP error! status: ${searchResponse.status}`);
            }
            
            const searchData = await searchResponse.json();
            
            if (searchData.items && searchData.items.length > 0) {
                // There are live streams
                const videoIds = searchData.items.map(item => item.id.videoId).join(',');
                
                // Get more details about these videos
                const videosResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${videoIds}&key=${apiKey}`
                );
                
                if (!videosResponse.ok) {
                    throw new Error(`HTTP error! status: ${videosResponse.status}`);
                }
                
                const videosData = await videosResponse.json();
                
                setLivestreams(videosData.items || []);
                
                // Select the first stream by default
                if (videosData.items && videosData.items.length > 0) {
                    const firstStream = videosData.items[0];
                    setSelectedStream(firstStream);
                    
                    // Set viewer count
                    const concurrentViewers = firstStream.liveStreamingDetails?.concurrentViewers || 0;
                    setViewerCount(parseInt(concurrentViewers));
                    
                    setIsLive(true);
                }
            } else {
                // No live streams, try to get upcoming streams
                const upcomingResponse = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}`
                );
                
                if (upcomingResponse.ok) {
                    const upcomingData = await upcomingResponse.json();
                    
                    if (upcomingData.items && upcomingData.items.length > 0) {
                        const videoIds = upcomingData.items.map(item => item.id.videoId).join(',');
                        
                        const videosResponse = await fetch(
                            `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`
                        );
                        
                        if (videosResponse.ok) {
                            const videosData = await videosResponse.json();
                            setLivestreams(videosData.items || []);
                        }
                    } else {
                        // As a last resort, get the most recent videos
                        const recentResponse = await fetch(
                            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=5&key=${apiKey}`
                        );
                        
                        if (recentResponse.ok) {
                            const recentData = await recentResponse.json();
                            
                            if (recentData.items && recentData.items.length > 0) {
                                const videoIds = recentData.items.map(item => item.id.videoId).join(',');
                                
                                const videosResponse = await fetch(
                                    `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${apiKey}`
                                );
                                
                                if (videosResponse.ok) {
                                    const videosData = await videosResponse.json();
                                    setLivestreams(videosData.items || []);
                                }
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching YouTube data:', error);
            setError(handleApiError(error, 'fetching YouTube data'));
        } finally {
            setLoading(false);
        }
    }, [channelId, apiKey]);

    // Function to select a stream
    const selectStream = (stream) => {
        setSelectedStream(stream);
        
        // Update viewer count if it's a live stream
        if (stream.liveStreamingDetails?.concurrentViewers) {
            setViewerCount(parseInt(stream.liveStreamingDetails.concurrentViewers));
            setIsLive(true);
        } else {
            setViewerCount(stream.statistics?.viewCount || 0);
            setIsLive(false);
        }
    };

    // No need for a save configuration function as we're using environment variables

    // Function to copy service info
    const copyServiceInfo = () => {
        if (!selectedStream) return;
        
        // Get the current date formatted as requested - August 19, 2025
        const now = new Date();
        const dateFormatted = now.toLocaleDateString('en-US', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric' 
        }).toUpperCase();
        
        // Get the service title
        const serviceTitle = selectedStream.snippet?.title || 'Live Service';
        
        // Format the text using the dynamic service information
        const textToCopy = `SERVICE TITLE: ${serviceTitle} |${dateFormatted}| FAITH TABERNACLE\n\nONLINE WORSHIPPERS COUNT: ${viewerCount}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy);
        
        // Show the tooltip for feedback
        const tooltip = document.getElementById('copy-tooltip');
        if (tooltip) {
            tooltip.classList.remove('opacity-0');
            tooltip.classList.add('opacity-100');
            setTimeout(() => {
                tooltip.classList.remove('opacity-100');
                tooltip.classList.add('opacity-0');
            }, 2000);
        }
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

    // Effect for the live timer
    useEffect(() => {
        if (isLive) {
            const timerInterval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
            
            return () => clearInterval(timerInterval);
        } else {
            setElapsedTime(0);
        }
    }, [isLive]);

    // Effect to periodically update the viewer count from the church API
    useEffect(() => {
        if (!channelId || !apiKey) {
            setError("YouTube API key or Channel ID is missing. Please check your environment variables.");
            setLoading(false);
            return;
        }

        // Initial fetch for all data
        fetchYouTubeLivestreams(false);
        
        // Set up interval for viewer count updates only
        const viewerCountInterval = 30000; // 30 seconds
        const countInterval = setInterval(() => fetchYouTubeLivestreams(true), viewerCountInterval);
        
        return () => clearInterval(countInterval);
    }, [fetchYouTubeLivestreams, channelId, apiKey]);

    return (
       <div 
         className="page-container relative bg-cover bg-center bg-no-repeat"
         style={{ backgroundImage: `url(${background})` }}
       >
        <div className="background-overlay"></div>
        <Navigation />
        
        <div className="relative z-10 flex-1 py-8">
            <div className="max-w-6xl mx-auto px-4">
                
                {/* Channel Info Section */}
                <div className="mb-8 bg-white/10 backdrop-blur-md p-6 rounded-lg">
                    <h2 className="text-xl font-bold text-white mb-4">YouTube Live Service</h2>
                    
                    {error && (
                        <div className="bg-red-500/30 border border-red-500/50 rounded-lg p-3 mb-4">
                            <p className="text-white font-medium">⚠️ Error</p>
                            <p className="text-white/90 text-sm">{error}</p>
                        </div>
                    )}
                    
                    <div className="flex flex-wrap justify-between items-center">
                        <div>
                            <p className="text-white text-sm">
                                Fetching live services from YouTube channel: <span className="font-semibold text-church-gold">{channelId}</span>
                            </p>
                            <p className="text-white/70 text-xs mt-1">
                                Channel data refreshes automatically. Online worshippers count is synchronized with the main service.
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={() => fetchYouTubeLivestreams(false)}
                            className="bg-church-gold hover:bg-church-gold/80 text-black"
                        >
                            Refresh Content
                        </Button>
                    </div>
                </div>
                
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center min-h-[400px]">
                        <LoadingSpinner size="lg" text="🔄 Loading YouTube data..." />
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
                                onClick={() => fetchYouTubeLivestreams(false)}
                            >
                                Try Again
                            </Button>
                        </Card>
                    </div>
                )}
                
                {/* Content Section */}
                {!loading && !error && (
                    <div className="grid md:grid-cols-3 gap-6">
                        {/* Livestream List */}
                        <div className="md:col-span-1">
                            <Card variant="glass" className="p-4">
                                <h3 className="text-lg font-bold text-white mb-4">
                                    {livestreams.length > 0 
                                        ? 'Available Streams' 
                                        : 'No Streams Found'}
                                </h3>
                                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                    {livestreams.map(stream => (
                                        <div 
                                            key={stream.id}
                                            onClick={() => selectStream(stream)}
                                            className={`
                                                cursor-pointer rounded-lg overflow-hidden
                                                ${selectedStream?.id === stream.id ? 'ring-2 ring-church-gold' : ''}
                                                hover:bg-white/10 transition-colors
                                            `}
                                        >
                                            <div className="relative">
                                                <img 
                                                    src={stream.snippet?.thumbnails?.medium?.url} 
                                                    alt={stream.snippet?.title} 
                                                    className="w-full h-auto" 
                                                />
                                                {stream.liveStreamingDetails?.concurrentViewers && (
                                                    <div className="absolute bottom-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
                                                        LIVE • {stream.liveStreamingDetails.concurrentViewers} watching
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-3">
                                                <h4 className="font-medium text-white line-clamp-2">
                                                    {stream.snippet?.title}
                                                </h4>
                                                <p className="text-white/70 text-sm mt-1">
                                                    {new Date(stream.snippet?.publishedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {livestreams.length === 0 && (
                                        <div className="text-center py-8">
                                            <p className="text-white/70">
                                                No streams found for this channel. Please check the Channel ID or try again later.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </div>
                        
                        {/* Video Player */}
                        <div className="md:col-span-2">
                            {selectedStream ? (
                                <div className="space-y-6">
                                    <div className="video-responsive">
                                        <ReactPlayer 
                                            url={`https://www.youtube.com/watch?v=${selectedStream.id}`}
                                            width="100%" 
                                            height="100%"
                                            controls
                                            playing
                                            className="rounded-lg shadow-2xl"
                                        />
                                    </div>
                                    
                                    {/* Stream Information Cards */}
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <Card variant="glass" className="p-6">
                                            <div className="flex items-center justify-center space-x-3">
                                                <span className="text-3xl">📺</span>
                                                <div>
                                                    <p className="text-sm text-gray-300">Service Title</p>
                                                    <p className="font-bold text-lg">
                                                        {selectedStream.snippet?.title || 'Live Service'}
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
                                                                    SERVICE TITLE: {selectedStream.snippet?.title || 'Live Service'} | Current Date | FAITH TABERNACLE
                                                                    
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
                                    
                                    {/* Live Indicator and Timer */}
                                    <div className="text-center flex flex-col items-center space-y-2">
                                        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${
                                            isLive 
                                                ? 'bg-red-600 animate-pulse-slow' 
                                                : 'bg-gray-600'
                                        } text-white`}>
                                            <div className={`w-3 h-3 bg-white rounded-full ${isLive ? 'animate-pulse' : ''}`}></div>
                                            <span className="font-semibold">{isLive ? 'LIVE NOW' : 'RECORDED'}</span>
                                        </div>
                                        {isLive && (
                                            <div className="text-white/90 flex items-center space-x-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-sm">Duration: {formatElapsedTime(elapsedTime)}</span>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Video Details */}
                                    <div className="bg-white/10 backdrop-blur-md rounded-lg p-4">
                                        <h3 className="font-bold text-xl text-white mb-2">
                                            {selectedStream.snippet?.title}
                                        </h3>
                                        <div className="flex items-center space-x-2 text-white/70 mb-4">
                                            <span>{new Date(selectedStream.snippet?.publishedAt).toLocaleDateString()}</span>
                                            <span>•</span>
                                            <span>
                                                {selectedStream.statistics?.viewCount 
                                                    ? `${selectedStream.statistics.viewCount} views` 
                                                    : isLive ? 'Live Now' : ''}
                                            </span>
                                        </div>
                                        <p className="text-white/90 whitespace-pre-line">
                                            {selectedStream.snippet?.description}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Card variant="default" className="p-8 text-center">
                                    <div className="text-6xl mb-4">📺</div>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">No Stream Selected</h2>
                                    <p className="text-gray-600">
                                        Please select a stream from the list on the left or configure your YouTube channel details.
                                    </p>
                                </Card>
                            )}
                        </div>
                    </div>
                )}
                
            </div>
        </div>
        
        <Footer />
       </div>
    );
}

export default YouTubeService;
