const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// POST /api/plant-growth/grow
router.post('/grow', async (req, res) => {
  const userId = req.userId;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch the plant growth record
    let growth = await prisma.plantGrowth.findUnique({ where: { userId } });

    // If no record exists, create a new one starting at level 1 (index 0 visually)
    if (!growth) {
      growth = await prisma.plantGrowth.create({
        data: {
          user: { connect: { id: userId } },
          level: 1, // same as stage 1, index 0
          lastGrowthDate: null,
        },
      });
    }

    // Prevent growing more than once per day
    const alreadyGrewToday =
      growth.lastGrowthDate &&
      new Date(growth.lastGrowthDate).toDateString() === today.toDateString();

    if (alreadyGrewToday) {
      return res.json({
        grown: false,
        level: growth.level,
        message: 'Already grew today',
      });
    }

    // Increase level by 1, but cap it at 6 (6 stages total)
    const nextLevel = Math.min(growth.level + 1, 6);

    await prisma.plantGrowth.update({
      where: { userId },
      data: {
        level: nextLevel,
        lastGrowthDate: today,
      },
    });

    return res.json({ grown: true, level: nextLevel });
  } catch (err) {
    console.error('Error growing plant:', err);
    return res.status(500).json({ error: 'Failed to grow plant' });
  }
});

// GET /api/plant-growth/me
router.get('/me', async (req, res) => {
  try {
    const growth = await prisma.plantGrowth.findUnique({
      where: { userId: req.userId },
    });

    // If no record, default to level 1 (stage 1 = index 0)
    if (!growth) {
      return res.json({ level: 1, lastGrowthDate: null });
    } else {
        res.json({
            level: growth.level,
            lastGrowthDate: growth.lastGrowthDate,
        });
    }

    res.json(growth);
  } catch (err) {
    console.error('Error fetching plant growth:', err);
    res.status(500).json({ error: 'Failed to fetch plant growth' });
  }
});

module.exports = router;
