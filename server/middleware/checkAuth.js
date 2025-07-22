const jwt = require('jsonwebtoken');
const { STATUS } = require('../constants');

const checkAuth = (req, res, next) => {
  try {
    const authHeader = req.header('authorization') || req.header('Authorization');
    if (!authHeader) {
      return res.status(STATUS.NOT_AUTHORIZED).json({
        error: 'Authorization header missing',
        message: 'Please provide an Authorization header with Bearer token'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      return res.status(STATUS.NOT_AUTHORIZED).json({
        error: 'No token found',
        message: 'Authorization header must include a valid Bearer token'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(STATUS.NOT_AUTHORIZED).json({
        error: 'Invalid token',
        message: 'The provided token is malformed or invalid'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(STATUS.NOT_AUTHORIZED).json({
        error: 'Token expired',
        message: 'Your session has expired. Please login again'
      });
    }

    // Return the actual error for debugging
    return res.status(STATUS.NOT_AUTHORIZED).json({
      error: 'Authentication failed',
      message: error.message || 'Unable to authenticate request'
    });
  }
};

module.exports = checkAuth;
