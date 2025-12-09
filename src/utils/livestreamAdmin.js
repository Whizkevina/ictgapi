import { config } from '../config/config';
import YouTubeFallbackHandler from './YouTubeFallbackHandler';

const STATIC_PAYLOAD_FIELDS = {
  AppVersion: '1.30',
  ForceUpdate: false,
  EnableGeoLocation: true,
  EnableGiving: true,
  IncrementOnlineUsers: true,
  OnlineUsersCount: 0,
  TestimoniesPlaceholder: 'Testify to the goodness of the Lord in your life. Share your testimony with the brethren and be blessed.',
  AnnouncementsPlaceholder: 'View announcements of upcoming church events and activities here.',
  PrivacyPolicyUrl: 'https://wwma-privacy.netlify.app',
  OnlineGivingUrl: 'https://give.domi.org.ng',
  DownloadsUrl: 'https://faithtabernacle.org.ng/downloads',
  OnlineBookStoreUrl: 'https://domionlinestore.org',
  DomiRadio: 'https://streams.domimedia.org/domi_radio_english/live.m3u8'
};

const buildDynamicPayloadFields = () => ({
  YouTubeClannelID: config.stream.youtubeChannelId || 'SET_CHANNEL_ID_IN_ENV',
  YouTubeApiKey: config.stream.youtubeApiKey || 'SET_YOUTUBE_API_KEY_IN_ENV'
});

export const normalizeLivestreamUrl = (url = '') => {
  if (url === null || typeof url === 'undefined') return '';
  if (typeof url !== 'string') {
    try {
      return String(url);
    } catch {
      return '';
    }
  }
  if (!url.trim()) return '';
  const videoId = YouTubeFallbackHandler.extractYouTubeVideoId(url);
  return videoId ? `https://youtu.be/${videoId}` : url.trim();
};

export const buildLivestreamPayload = ({
  LiveStreamUrl = '',
  LiveStreamTitle = ''
}, overrides = {}) => ({
  ...STATIC_PAYLOAD_FIELDS,
  ...buildDynamicPayloadFields(),
  ...overrides,
  LiveStreamUrl: normalizeLivestreamUrl(LiveStreamUrl),
  LiveStreamTitle: (LiveStreamTitle || '').trim()
});

export const getVideoIdFromUrl = (url) => {
  if (!url) return null;
  return YouTubeFallbackHandler.extractYouTubeVideoId(url);
};

export const buildManualInstructions = ({
  payload,
  updateUrl,
  authToken,
  fallbackEndpoints = []
}) => {
  const formattedBody = JSON.stringify(payload, null, 2);
  const formattedFallbacks = fallbackEndpoints.length
    ? fallbackEndpoints.map((endpoint, index) => `${index + 1}. ${endpoint}`).join('\n')
    : 'None specified';

  return `API Update Information (Use in Postman or similar API client):\n\nURL: ${updateUrl}\nMethod: PUT (Important: Must use PUT, not POST)\nHeaders:\n  Content-Type: application/json\n  x-auth-token: ${authToken || '[Not configured]'}\n\nBody:\n${formattedBody}\n\nAlternative endpoints to try if the above fails:\n${formattedFallbacks}`;
};

