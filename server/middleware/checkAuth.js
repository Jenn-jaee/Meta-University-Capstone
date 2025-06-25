const jwt = require('jsonwebtoken');

const checkAuth = async (req, res, next) => {
  try {
    // Get the token from the header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token found');
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({error: 'Auth failed'})
  }
}

module.exports = checkAuth;
