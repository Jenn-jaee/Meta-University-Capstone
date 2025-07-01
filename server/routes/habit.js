const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

// All habit routes require authentication
router.use(checkAuth);

// POST /api/habits - Create a new habit
router.post('/', async (req, res) => {
  try {
    const { title, description } = req.body;

    const habit = await prisma.habit.create({
      data: {
        title,
        description,
        userId: req.userId,
      },
    });

    res.json(habit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Failed to create habit' });
  }
});

// GET /api/habits - Get all habits for the user
router.get('/', async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(habits);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Failed to fetch habits' });
  }
});

// PUT /api/habits/:id - Update a habit
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;

    const updated = await prisma.habit.update({
      where: { id: req.params.id },
      data: { title, description },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Failed to update habit' });
  }
});

// PATCH /api/habits/:id/toggle - Toggle active status or increment streak
router.patch('/:id/toggle', async (req, res) => {
  try {
    const habit = await prisma.habit.findUnique({ where: { id: req.params.id } });

    if (!habit) return res.status(404).json({ message: 'Habit not found' });

    const updated = await prisma.habit.update({
      where: { id: req.params.id },
      data: {
        isActive: !habit.isActive,
        streak: habit.isActive ? habit.streak : habit.streak + 1,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('Error toggling habit:', error);
    res.status(500).json({ message: 'Failed to toggle habit' });
  }
});

// DELETE /api/habits/:id - Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    await prisma.habit.delete({ where: { id: req.params.id } });
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Failed to delete habit' });
  }
});

module.exports = router;
