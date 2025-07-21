
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { invalidateFeed } = require('../utils/invalidateFeed');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// POST /api/mood-logs
router.post('/', (req, res) => {
  const { mood, note } = req.body;
  const userId = req.userId;

  if (typeof mood !== 'number') {
    return res
      .status(STATUS.BAD_REQUEST)
      .json({ error: 'Invalid mood value' });
  }

  // Check if a mood log already exists for today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  prisma.moodLog.findFirst({
    where: {
      userId,
      createdAt: { gte: startOfDay },
    },
  })
  .then(existingMood => {
    if (existingMood) {
      return res
        .status(STATUS.BAD_REQUEST)
        .json({ error: "You've already checked in today" });
    }

    // Create new mood log
    return prisma.moodLog.create({
      data: {
        mood,
        note,
        user: { connect: { id: userId } },
      },
    })
    .then(newMoodLog => {
      // Get user's connections to invalidate their feed caches
      return prisma.$queryRaw`
        SELECT "userBId" AS id
        FROM "Connection"
        WHERE "userAId" = ${userId}
        UNION
        SELECT "userAId" AS id
        FROM "Connection"
        WHERE "userBId" = ${userId};
      `
      .then(connections => {
        const connectionIds = connections.map((c) => c.id);

        // Invalidate feed caches
        invalidateFeed(userId, connectionIds);

        return res.status(STATUS.SUCCESS).json(newMoodLog);
      });
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to create mood log' });
  });
});

// GET /api/mood-logs/today
router.get('/today', (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  prisma.moodLog.findFirst({
    where: {
      userId: req.userId,
      createdAt: {
        gte: today
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  .then(mood => {
    return res.json(mood || null);
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to fetch mood log' });
  });
});

// GET /api/mood-logs
router.get('/', (req, res) => {
  const { from } = req.query;
  const where = { userId: req.userId };
  if (from) where.createdAt = { gte: new Date(from) };

  prisma.moodLog
    .findMany({ where, orderBy: { createdAt: 'asc' } })
    .then((logs) => res.json(logs))
    .catch(() =>
      res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to fetch mood logs' })
    );
});



module.exports = router;
