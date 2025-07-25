const express = require('express');
const { STATUS } = require('../constants');
const checkAuth = require('../middleware/checkAuth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { getRankedBanners } = require('../utils/recEngine');


const router = express.Router();
router.use(checkAuth);

// GET /api/recommendation
router.get('/', async (req, res) => {
  try {
    // Get all ranked banners for this user
    const banners = await getRankedBanners(req.userId);

    // Get the top banner (if any)
    const topBanner = banners[0] || null;

    // If we have a banner to show, record that it was seen
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

      if (process.env.NODE_ENV === 'development') {
        return res.json({
          banner: topBanner,
          debug: {
            allBanners: banners,
            totalBanners: banners.length
          }
        });
      }
    }

    return res.json({ banner: topBanner });

  } catch (e) {
    return res
      .status(STATUS.SERVER_ERROR)
      .json({ error: 'Failed to compute recommendation' });
  }
});

// POST /api/recommendation/dismiss
router.post('/dismiss', async (req, res) => {
  try {
    const { tag } = req.body;

    if (!tag) {
      return res.status(STATUS.BAD_REQUEST).json({ error: 'Banner tag is required' });
    }

    await prisma.userBannerHistory.upsert({
      where: {
        userId_bannerTag: {
          userId: req.userId,
          bannerTag: tag,
        },
      },
      update: {
        dismissedAt: new Date(),
      },
      create: {
        userId: req.userId,
        bannerTag: tag,
        dismissedAt: new Date(),
      },
    });

    return res.json({ success: true });
  } catch (e) {
    return res
      .status(STATUS.SERVER_ERROR)
      .json({ error: 'Failed to record banner dismissal' });
  }
});

module.exports = router;
