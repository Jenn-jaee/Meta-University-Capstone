const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// POST /api/plant-growth/grow
router.post('/grow', (req, res) => {
  const userId = req.userId;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  prisma.plantGrowth
    .findUnique({ where: { userId } })
    .then((growth) => {
      // If no record, create one at level 1
      if (!growth) {
        return prisma.plantGrowth.create({
          data: {
            user: { connect: { id: userId } },
            level: 1,
            lastGrowthDate: null,
          },
        });
      }
      return growth;
    })
    .then((growth) => {
      // Prevent double-grow in same day
      const alreadyGrewToday =
        growth.lastGrowthDate &&
        new Date(growth.lastGrowthDate).toDateString() ===
          today.toDateString();

      if (alreadyGrewToday) {
        return res.json({
          grown: false,
          level: growth.level,
          message: 'Already grew today',
        });
      }

      // Increment, cap at 6
      const nextLevel = Math.min(growth.level + 1, 6);

      return prisma.plantGrowth
        .update({
          where: { userId },
          data: { level: nextLevel, lastGrowthDate: today },
        })
        .then(() => res.json({ grown: true, level: nextLevel }));
    })
    .catch(() =>
      res
        .status(STATUS.SERVER_ERROR)
        .json({ error: 'Failed to grow plant' })
    );
});


// GET /api/plant-growth/me
router.get('/me', (req, res) => {
  prisma.plantGrowth
    .findUnique({ where: { userId: req.userId } })
    .then((growth) => {
      if (!growth) {
        // Default to level 1 if no record
        return res.json({ level: 1, lastGrowthDate: null });
      }
      return res.json({
        level: growth.level,
        lastGrowthDate: growth.lastGrowthDate,
      });
    })
    .catch(() =>
      res
        .status(STATUS.SERVER_ERROR)
        .json({ error: 'Failed to fetch plant growth' })
    );
});

module.exports = router;
