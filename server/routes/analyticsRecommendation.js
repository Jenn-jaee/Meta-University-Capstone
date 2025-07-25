const express = require('express');
const { STATUS } = require('../constants');
const checkAuth = require('../middleware/checkAuth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getRankedBanners } = require('../utils/recEngine');


const router = express.Router();
router.use(checkAuth);

// GET /api/recommendation
// Returns the highest-ranked personalized banner or null
router.get('/recommendation', async (req, res) => {
  try {
    const banners = await getRankedBanners(req.userId);
const topBanner = banners[0] || null;

if (topBanner) {
  await prisma.userBannerHistory.upsert({
    where: {
      userId_bannerTag: {
        userId: req.userId,
        bannerTag: topBanner.tag,
      },
    },
    update: {
      seenAt: new Date(),
    },
    create: {
      userId: req.userId,
      bannerTag: topBanner.tag,
      seenAt: new Date(),
    },
  });
}

return res.json({ banner: topBanner });

  } catch (e) {
    return res
      .status(STATUS.SERVER_ERROR)
      .json({ error: 'Failed to compute recommendation' });
  }
});

module.exports = router;
