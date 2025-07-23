const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { invalidateFeed } = require('../utils/invalidateFeed');
const { STATUS } = require('../constants');


const router = express.Router();
const prisma = new PrismaClient();

// All habit log routes require authentication
router.use(checkAuth);

// POST /api/habit-logs - Create or update today's habit log
router.post('/', (req, res) => {
  const userId = req.userId;
  const { habitId, completed } = req.body;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Check if there's already a log for this habit today
    const existingLog = await prisma.habitLog.findFirst({
      where: {
        userId,
        habitId,
        date: {
          gte: today,
          lt: endOfToday,
        },

      },
    },
  })
  .then(existingLog => {
    let resultPromise;


    // Get the habit details
    const habit = await prisma.habit.findUnique({
      where: { id: habitId },
    });

    if (!habit) {
      return res.status(STATUS.NOT_FOUND).json({ error: 'Habit not found' });
    }

    // Start with current streak value
    let newStreak = habit.streak;

    // STREAK CALCULATION LOGIC
    // Only recalculate streak when completing a habit that wasn't already completed today
    if (completed && !existingLog) {
      // Set up date range for yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfYesterday = new Date(yesterday);
      startOfYesterday.setHours(0, 0, 0, 0);
      const endOfYesterday = new Date(startOfYesterday);
      endOfYesterday.setHours(23, 59, 59, 999);

      // Check if the habit was completed yesterday
      const yesterdayLog = await prisma.habitLog.findFirst({
        where: {
          userId,
          habitId,
          completed: true,
          date: {
            gte: startOfYesterday,
            lt: endOfYesterday,
          },
        },
      });

      if (yesterdayLog) {
        // If completed yesterday, increment the streak
        newStreak = habit.streak + 1;
      } else {
        // If not completed yesterday, check when it was last completed
        const lastCompletedLog = await prisma.habitLog.findFirst({
          where: {
            userId,
            habitId,
            completed: true,
            date: {
              lt: today,
            },
          },
          orderBy: {
            date: 'desc',
          },
        });

        if (!lastCompletedLog) {
          // First time ever completing this habit
          newStreak = 1;
        } else {
          // Calculate days since last completion
          const lastLogDate = new Date(lastCompletedLog.date);
          const daysSinceLastLog = Math.floor((today - lastLogDate) / (1000 * 60 * 60 * 24));

          if (daysSinceLastLog > 1) {
            // More than a day has passed, reset streak to 1
            newStreak = 1;
          } else {
            // Last completion was within a day, continue streak
            newStreak = habit.streak + 1;
          }
        }
      }
    }
    // Note: If uncompleting today's habit, we don't change the streak
    // The streak only resets if a day passes without completion

    // Update the habit's streak in the database
    await prisma.habit.update({
      where: { id: habitId },
      data: { streak: newStreak },
    });

    // Create or update the habit log
    let result;
    if (existingLog) {
      // Update existing log if one exists for today
      result = await prisma.habitLog.update({

        where: { id: existingLog.id },
        data: { completed },
      });
    } else {
      // Create new log if none exists for today
      result = await prisma.habitLog.create({

        data: {
          userId,
          habitId,
          completed,
          date: new Date(),
        },
      });
    }

    // Get user's connections to invalidate their feed caches
    const connections = await prisma.$queryRaw`
      SELECT "userBId" AS id
      FROM "Connection"
      WHERE "userAId" = ${userId}
      UNION
      SELECT "userAId" AS id
      FROM "Connection"
      WHERE "userBId" = ${userId};
    `;

    const connectionIds = connections.map((c) => c.id);

    // Invalidate feed caches for social features
    invalidateFeed(userId, connectionIds);

    // Return the result with the updated streak
    return res.status(STATUS.SUCCESS).json({
      ...result,
      streak: newStreak
    });
  } catch (error) {
    return res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to log habit' });
  }
});

/**
 * GET /api/habit-logs/today - Fetch all of today's habit logs for user
 *
 * This endpoint retrieves all habit logs for the current day
 * Used to determine which habits have been completed today
 *
 * Response:
 * - Array of habit logs for the current day
 */
router.get('/today', (req, res) => {
  const userId = req.userId;

  // Set up date range for today (midnight to midnight)
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // Find all habit logs for today

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
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Failed to fetch habit logs' });

  });
});

module.exports = router;
