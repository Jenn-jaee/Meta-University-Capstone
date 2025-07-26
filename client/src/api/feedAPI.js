import axiosInstance from './axiosInstance';
import { getMoodEmoji } from '../utils/moodUtils';

// Constants
const API_ENDPOINTS = {
  FEED: '/api/feed',
  CONNECTIONS: '/api/connections'
};

const CONTENT_TYPES = {
  MOOD: 'MOOD'
};

const USER_DEFAULTS = {
  UNKNOWN_USER: 'Unknown User',
  CONNECTED_USER: 'Connected User'
};

const TIME_UNITS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
  WEEK: 604800,
  MONTH: 2592000,
  YEAR: 31536000
};

const TIME_FORMATS = {
  JUST_NOW: 'Just now',
  YESTERDAY: 'Yesterday',
  MINUTE: 'minute',
  MINUTES: 'minutes',
  HOUR: 'hour',
  HOURS: 'hours',
  DAY: 'days',
  WEEK: 'week',
  WEEKS: 'weeks',
  MONTH: 'month',
  MONTHS: 'months',
  YEAR: 'year',
  YEARS: 'years'
};

/**
 * Get feed items from the backend
 * @param {string|null} cursor - Pagination cursor (ISO8601 date string)
 * @returns {Promise<{items: Array, nextCursor: string|null}>} Feed items and next cursor
 */
export const getFeedItems = async (cursor = null) => {
  try {
    const url = cursor ? `${API_ENDPOINTS.FEED}?cursor=${cursor}` : API_ENDPOINTS.FEED;
    const response = await axiosInstance.get(url);

    // Check if we have any items
    if (!response.data.items || response.data.items.length === 0) {
      return { items: [], nextCursor: null };
    }

    // Transform the backend data to match our frontend component needs
    const transformedItems = await Promise.all(
      response.data.items.map(async (item) => {
        // Get user info for each feed item
        const userInfo = await getUserInfo(item.userId);

        // Format timestamp
        const timestamp = formatTimestamp(item.createdAt);

        // Convert numeric mood to emoji using the imported getMoodEmoji function
        let moodEmoji = null;
        if (item.type === CONTENT_TYPES.MOOD && item.extra !== null) {
          const moodValue = parseInt(item.extra);
          moodEmoji = getMoodEmoji(moodValue);
        }

        // Create a properly formatted feed item based on type
        return {
          id: item.id,
          userId: item.userId,
          displayName: userInfo?.displayName || USER_DEFAULTS.UNKNOWN_USER,
          profilePhoto: userInfo?.profilePhoto || null,
          content: item.content,
          moodEmoji: moodEmoji,
          type: item.type,
          timestamp: timestamp,
          createdAt: item.createdAt
        };
      })
    );

    return {
      items: transformedItems,
      nextCursor: response.data.nextCursor
    };
  } catch (error) {
    throw new Error(`Failed to fetch feed items: ${error.message}`);
  }
};

/**
 * Get user information by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User information
 */
const getUserInfo = async (userId) => {
  try {
    // Initialize cache if it doesn't exist
    if (!getUserInfo.cache) {
      getUserInfo.cache = {};
      getUserInfo.connectionsLoaded = false;
    }

    // Return cached user info if available
    if (getUserInfo.cache[userId]) {
      return getUserInfo.cache[userId];
    }

    // If connections haven't been loaded yet, fetch them all at once
    if (!getUserInfo.connectionsLoaded) {
      try {
        // First try to get all connections
        const connectionsResponse = await axiosInstance.get(API_ENDPOINTS.CONNECTIONS);
        const connections = connectionsResponse.data;

        // Cache all connection user info
        connections.forEach(user => {
          getUserInfo.cache[user.id] = {
            displayName: user.displayName,
            profilePhoto: user.avatarUrl // Note: backend uses avatarUrl, frontend uses profilePhoto
          };
        });

        getUserInfo.connectionsLoaded = true;

        // If the requested user is in the connections, return it
        if (getUserInfo.cache[userId]) {
          return getUserInfo.cache[userId];
        }
      } catch (connError) {
        // Silent fail - continue to fallback approach if connections fetch fails
      }
    }

    // Fallback: If user not found in connections, use a placeholder
    const placeholder = {
      displayName: USER_DEFAULTS.CONNECTED_USER,
      profilePhoto: null
    };

    getUserInfo.cache[userId] = placeholder;
    return placeholder;
  } catch (error) {
    return {
      displayName: USER_DEFAULTS.CONNECTED_USER,
      profilePhoto: null
    };
  }
};

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 * @param {string} dateString - ISO8601 date string
 * @returns {string} Formatted relative time
 */
const formatTimestamp = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < TIME_UNITS.MINUTE) {
    return TIME_FORMATS.JUST_NOW;
  }

  const diffInMinutes = Math.floor(diffInSeconds / TIME_UNITS.MINUTE);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? TIME_FORMATS.MINUTE : TIME_FORMATS.MINUTES} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? TIME_FORMATS.HOUR : TIME_FORMATS.HOURS} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? TIME_FORMATS.YESTERDAY : `${diffInDays} ${TIME_FORMATS.DAY} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? TIME_FORMATS.WEEK : TIME_FORMATS.WEEKS} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} ${diffInMonths === 1 ? TIME_FORMATS.MONTH : TIME_FORMATS.MONTHS} ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} ${diffInYears === 1 ? TIME_FORMATS.YEAR : TIME_FORMATS.YEARS} ago`;
};

/**
 * Load more feed items using pagination
 * @param {string} cursor - Pagination cursor
 * @returns {Promise<{items: Array, nextCursor: string|null}>} Additional feed items and next cursor
 */
export const loadMoreFeedItems = async (cursor) => {
  return await getFeedItems(cursor);
};
