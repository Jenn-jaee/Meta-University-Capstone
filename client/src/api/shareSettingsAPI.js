import axios from './axiosInstance';

/**
 * Get the current user's share settings
 * @returns {Promise} Promise that resolves to the share settings
 */
export const getShareSettings = () => {
  return axios.get('/api/share-settings');
};

/**
 * Update the current user's share settings
 * @param {Object} settings - The settings to update
 * @returns {Promise} Promise that resolves when the settings are updated
 */
export const updateShareSettings = (settings) => {
  return axios.patch('/api/share-settings', settings);
};
