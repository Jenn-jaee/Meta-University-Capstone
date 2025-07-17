/**
 * Creates a simplified user object with essential display information
 *
 * @param {Object} user - The full user object from the database
 * @returns {Object} Formatted user with id, displayName and avatarUrl
 */
function formatUserPreview(user) {
  if (!user) return null;

  return {
    id: user.id,
    displayName: user.displayName || user.name || 'Anonymous',
    avatarUrl: user.avatarUrl || null,
  };
}

module.exports = {
  formatUserPreview,
};
