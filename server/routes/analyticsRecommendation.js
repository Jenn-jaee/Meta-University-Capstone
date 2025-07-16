// Delivers one recommendation banner per request, based on
// journal + mood streak analysis in utils/recommendation.js

const express = require('express');
const { STATUS } = require('../constants');
const checkAuth = require('../middleware/checkAuth');
const getRecommendation = require('../utils/recommendation');

const router = express.Router();
router.use(checkAuth);

// GET /api/recommendation
// Reads the current user's streak metrics and returns the best-fit banner
router.get('/recommendation', async (req, res) => {
  try {
    const banner = await getRecommendation(req.userId);

    // When no personalized banner is available we still return 200 with {banner:null}
    // so the client can skip rendering any suggestion gracefully
    return res.json({ banner });
  } catch (e) {
    console.error('Recommendation error:', e);
    return res
      .status(STATUS.SERVER_ERROR)
      .json({ error: 'Failed to compute recommendation' });
  }
});

module.exports = router;
