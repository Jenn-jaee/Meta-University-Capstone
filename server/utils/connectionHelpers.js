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

/**
 * Validates if a user has permission to access a connection request
 *
 * @param {Object} request - The connection request object
 * @param {string} userId - The ID of the user trying to access the request
 * @param {string} role - Either 'sender' or 'receiver' to specify which role the user should have
 * @returns {boolean} - True if the user has permission, false otherwise
 */
function validateRequestAccess(request, userId, role) {
  if (!request) return false;

  if (role === 'sender') {
    return request.senderId === userId;
  } else if (role === 'receiver') {
    return request.receiverId === userId;
  }

  return false;
}

module.exports = {
  formatUserPreview,
  validateRequestAccess,
};
