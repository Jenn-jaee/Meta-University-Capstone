const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

// All habit log routes require authentication
router.use(checkAuth);

// POST /api/habit-logs - Create or update today's habit log
router.post('/', async (req, res) => {
  const userId = req.userId;
  const { habitId, completed } = req.body;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingLog = await prisma.habitLog.findFirst({
      where: {
        userId,
        habitId,
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // end of today
        },
      },
    });

    let result;
    if (existingLog) {
      result = await prisma.habitLog.update({
        where: { id: existingLog.id },
        data: { completed },
      });
    } else {
      result = await prisma.habitLog.create({
        data: {
          userId,
          habitId,
          completed,
          date: new Date(),
        },
      });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Error logging habit:', error);
    res.status(500).json({ error: 'Failed to log habit' });
  }
});

// GET /api/habit-logs/today - Fetch all of today's habit logs for user
router.get('/today', async (req, res) => {
  try {
    const userId = req.userId;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const logs = await prisma.habitLog.findMany({
      where: {
        userId,
        date: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    res.json(logs);
  } catch (error) {
    console.error("Error fetching today’s habit logs:", error);
    res.status(500).json({ message: 'Failed to fetch habit logs' });
  }
});

module.exports = router;
