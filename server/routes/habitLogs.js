const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { invalidateFeed } = require('../utils/invalidateFeed');

const router = express.Router();
const prisma = new PrismaClient();

// All habit log routes require authentication
router.use(checkAuth);

// POST /api/habit-logs - Create or update today's habit log
router.post('/', (req, res) => {
  const userId = req.userId;
  const { habitId, completed } = req.body;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  prisma.habitLog.findFirst({
    where: {
      userId,
      habitId,
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // end of today
      },
    },
  })
  .then(existingLog => {
    let resultPromise;

    if (existingLog) {
      resultPromise = prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed },
      });
    } else {
      resultPromise = prisma.habitLog.create({
        data: {
          userId,
          habitId,
          completed,
          date: new Date(),
        },
      });
    }

    return resultPromise.then(result => {
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

        return res.status(200).json(result);
      });
    });
  })
  .catch(() => {
    return res.status(500).json({ error: 'Failed to log habit' });
  });
});

// GET /api/habit-logs/today - Fetch all of today's habit logs for user
router.get('/today', (req, res) => {
  const userId = req.userId;
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  prisma.habitLog.findMany({
    where: {
      userId,
      date: {
        gte: startOfDay,
        lt: endOfDay,
      },
    },
  })
  .then(logs => {
    return res.json(logs);
  })
  .catch(() => {
    return res.status(500).json({ message: 'Failed to fetch habit logs' });
  });
});

module.exports = router;
