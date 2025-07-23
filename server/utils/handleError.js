const { STATUS } = require('../constants');

function handleError(res, err, message = 'Server error', status = STATUS.SERVER_ERROR) {
  // Error logging is removed for production code
  // In a real production environment, you would use a proper logging service
  // like Winston, Bunyan, or a cloud-based logging solution

  return res.status(status).json({ error: message });
}

module.exports = handleError;
