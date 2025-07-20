const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { invalidateFeed } = require('../utils/invalidateFeed');
const { STATUS } = require('../constants');

const router = express.Router();
const prisma = new PrismaClient();

// All habit routes require authentication
router.use(checkAuth);

// POST /api/habits - Create a new habit
router.post('/', (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;

  prisma.habit.create({
    data: {
      title,
      description,
      userId,
    },
  })
  .then(habit => {
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

      return res.json(habit);
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Failed to create habit' });
  });
});

// GET /api/habits - Get all habits for the user
router.get('/', (req, res) => {
  prisma.habit.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  .then(habits => {
    return res.json(habits);
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Failed to fetch habits' });
  });
});

// PUT /api/habits/:id - Update a habit
router.put('/:id', (req, res) => {
  const { title, description } = req.body;
  const userId = req.userId;

  prisma.habit.update({
    where: { id: req.params.id },
    data: { title, description },
  })
  .then(updated => {
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

      return res.json(updated);
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Failed to update habit' });
  });
});

// PATCH /api/habits/:id/toggle - Toggle active status
router.patch('/:id/toggle', (req, res) => {
  prisma.habit.findUnique({ where: { id: req.params.id } })
  .then(habit => {
    if (!habit) return res.status(STATUS.NOT_FOUND).json({ message: 'Habit not found' });

    return prisma.habit.update({
      where: { id: req.params.id },
      data: {
        isActive: !habit.isActive,
      },
    })
    .then(updated => {
      return res.json(updated);
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Failed to toggle habit' });
  });
});


// DELETE /api/habits/:id - Delete a habit

router.delete('/:id', async (req, res) => {
  const userId = req.userId;
  const habitId = req.params.id;

  try {
    // First delete all associated habit logs
    await prisma.habitLog.deleteMany({
      where: { habitId }
    });

    // Then delete the habit itself
    await prisma.habit.delete({
      where: { id: habitId }
    });

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

    // Invalidate feed caches
    invalidateFeed(userId, connectionIds);

    return res.status(STATUS.SUCCESS).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Failed to delete habit' });
  }
});

module.exports = router;
