
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// POST /api/mood-logs
router.post('/', async (req, res) => {
  try {
    const { mood, note } = req.body;
    const userId = req.userId;

    if (typeof mood !== 'number') {
      return res.status(400).json({ error: 'Invalid mood value' });
    }

    // Check if user has already logged mood today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const existingMood = await prisma.moodLog.findFirst({
      where: {
        userId,
        createdAt: {
          gte: startOfDay
        }
      }
    });

    if (existingMood) {
      return res.status(400).json({ error: "You've already checked in today" });
    }

    // Create new mood log if no log exists for today
    const newMoodLog = await prisma.moodLog.create({
      data: {
        mood,
        note,
        user: { connect: { id: userId } },
      },
    });

    res.status(201).json(newMoodLog);
  } catch (error) {
    console.error('Error creating mood log:', error);
    res.status(500).json({ error: 'Failed to create mood log' });
  }
});


// GET /api/mood-logs/today
router.get('/today', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const mood = await prisma.moodLog.findFirst({
      where: {
        userId: req.userId,
        createdAt: {
          gte: today
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(mood || null);
  } catch (err) {
    console.error('Error fetching today’s mood log:', err);
    res.status(500).json({ error: 'Failed to fetch mood log' });
  }
});


module.exports = router;
