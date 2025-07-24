
export const API_BASE_URL =
  (typeof window !== 'undefined' && window.ENV && window.ENV.REACT_APP_API_URL) ||
  'http://localhost:3001/api';

// Banner types
export const BANNER_TYPES = {
  WELCOME: 'welcome',
  MILESTONE: 'milestone',
  CELEBRATE: 'celebrate',
  ENCOURAGEMENT: 'encouragement',
  REENGAGEMENT: 'reengagement',
  EMOTIONAL_SUPPORT: 'emotional_support',
  FEATURE_DISCOVERY: 'feature_discovery',
  WARNING: 'warning',
  SUCCESS: 'success',
  INFO: 'info'
};

// Banner actions
export const BANNER_ACTIONS = {
  SHOWN: 'shown',
  DISMISSED: 'dismissed',
  ACTED_UPON: 'acted_upon'
};

// Recommendation categories
export const RECOMMENDATION_CATEGORIES = {
  ONBOARDING: 'onboarding',
  STREAK: 'streak',
  ENGAGEMENT: 'engagement',
  REENGAGEMENT: 'reengagement',
  FEATURE_DISCOVERY: 'feature_discovery',
  MILESTONE: 'milestone',
  EMOTIONAL_SUPPORT: 'emotional_support',
  ZERO_PROGRESS: 'zero_progress',
  HABIT: 'habit',
  INSIGHT: 'insight'
};
