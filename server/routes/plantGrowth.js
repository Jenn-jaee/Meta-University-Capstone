const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

router.post('/grow', async (req, res) => {
  const userId = req.userId;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(today.getDate() - 1);
    twoDaysAgo.setHours(0, 0, 0, 0);

    const recentMoods = await prisma.moodLog.findMany({
      where: {
        userId,
        createdAt: { gte: twoDaysAgo },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (recentMoods.length < 2) {
      return res.json({ grown: false });
    }

    let growth = await prisma.plantGrowth.findUnique({
      where: { userId },
    });

    const lastGrowthDate = growth?.lastGrowthDate
      ? new Date(growth.lastGrowthDate)
      : null;

    const hasGrownToday = lastGrowthDate?.toDateString() === today.toDateString();

    if (hasGrownToday) {
      return res.json({ grown: false });
    }

    const nextStage = growth ? Math.min(growth.stage + 1, 6) : 1;

    await prisma.plantGrowth.upsert({
      where: { userId },
      update: {
        stage: nextStage,
        lastGrowthDate: today,
      },
      create: {
        user: { connect: { id: userId } },
        stage: 1,
        lastGrowthDate: today,
      },
    });

    return res.json({ grown: true });
  } catch (err) {
    console.error('Error growing plant:', err);
    res.status(500).json({ error: 'Failed to grow plant' });
  }
});

// GET /api/plant-growth/me
router.get('/me', async (req, res) => {
  try {
    const growth = await prisma.plantGrowth.findFirst({
      where: { userId: req.userId },
    });

    // If no growth record exists, return a default structure
    if (!growth) {
      return res.json({ stage: 1, lastGrowthDate: null });
    }

    res.json(growth || {});
  } catch (error) {
    console.error('Error fetching plant growth:', error);
    res.status(500).json({ error: 'Failed to fetch plant growth' });
  }
});


module.exports = router;
