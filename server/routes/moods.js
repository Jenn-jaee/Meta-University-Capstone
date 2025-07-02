const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// GET /api/moods - get all moods for the logged-in user
router.get('/', async (req, res) => {
  try {
    const moods = await prisma.mood.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
    });
    res.json(moods);
  } catch (error) {
    console.error('Error fetching moods:', error);
    res.status(500).json({ error: 'Failed to fetch moods' });
  }
});

module.exports = router;
