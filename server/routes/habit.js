const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { invalidateFeed } = require('../utils/invalidateFeed');

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
    return res.status(500).json({ message: 'Failed to create habit' });
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
    return res.status(500).json({ message: 'Failed to fetch habits' });
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
    return res.status(500).json({ message: 'Failed to update habit' });
  });
});

// PATCH /api/habits/:id/toggle - Toggle active status or increment streak
router.patch('/:id/toggle', (req, res) => {
  prisma.habit.findUnique({ where: { id: req.params.id } })
  .then(habit => {
    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    return prisma.habit.update({
      where: { id: req.params.id },
      data: {
        isActive: !habit.isActive,
        streak: habit.isActive ? habit.streak : habit.streak + 1,
      },
    })
    .then(updated => {
      return res.json(updated);
    });
  })
  .catch(() => {
    return res.status(500).json({ message: 'Failed to toggle habit' });
  });
});

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', (req, res) => {
  const userId = req.userId;

  prisma.habit.delete({ where: { id: req.params.id } })
  .then(() => {
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

      return res.json({ message: 'Habit deleted successfully' });
    });
  })
  .catch(() => {
    return res.status(500).json({ message: 'Failed to delete habit' });
  });
});

module.exports = router;
