const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { invalidateFeed } = require('../utils/invalidateFeed');
const { updateWordFrequencies } = require('../utils/wordFrequencyTracker');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// GET /api/journal - Get all journal entries for user with filtering options
router.get('/', async (req, res) => {
  const { from, to, search, title, mood } = req.query;
  const where = { userId: req.userId };

  // Date range filters
  if (from || to) {
    where.createdAt = {};
    if (from) {
      const startDate = new Date(from);
      startDate.setHours(0, 0, 0, 0); // Start of day
      where.createdAt.gte = startDate;
      console.log(`Date filter from: ${startDate.toISOString()}`);
    }

    if (to) {
      // Create a date for the end of the selected day (23:59:59.999)
      // First, ensure we're working with the correct date by parsing it properly
      const [year, month, day] = to.split('-').map(num => parseInt(num, 10));
      // Note: month is 0-indexed in JavaScript Date
      const endDate = new Date(year, month - 1, day, 23, 59, 59, 999);

      where.createdAt.lte = endDate;
      console.log(`Date filter to: ${endDate.toISOString()}, Original input: ${to}`);
    }
  }

  // Content search (case insensitive)
  if (search) {
    where.content = {
      contains: search,
      mode: 'insensitive'
    };
  }

  // Title search (case insensitive)
  if (title) {
    where.title = {
      contains: title,
      mode: 'insensitive'
    };
  }

  // Mood filter
  if (mood !== undefined && mood !== null) {
    where.journalMood = parseInt(mood);
  }

  prisma.journalEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  .then((entries) => res.json(entries))
  .catch((error) => {
    console.error('Error fetching entries:', error);
    res.status(STATUS.SERVER_ERROR).json({ message: 'Error fetching entries' });
  });
});


// POST /api/journal - Create a new journal entry
router.post('/', (req, res) => {
  const { content, title, journalMood } = req.body;
  const userId = req.userId;

  prisma.journalEntry.create({
    data: {
      title: title || 'Untitled Entry',
      content,
      journalMood,
      userId,
    },
  })
  .then(entry => {
    // Track word frequencies for sentiment analysis
    updateWordFrequencies(userId, content)
      .catch(err => console.error('Error updating word frequencies:', err));

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

      return res.json(entry);
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Error creating entry' });
  });
});


// GET /api/journal/:id - Get a single journal entry
router.get('/:id', (req, res) => {
  prisma.journalEntry
    .findFirst({
      where: { id: req.params.id, userId: req.userId },
    })
    .then((entry) => {
      if (!entry) {
        return res
          .status(STATUS.NOT_FOUND)
          .json({ message: 'Entry not found' });
      }
      res.json(entry);
    })
    .catch(() =>
      res.status(STATUS.SERVER_ERROR).json({ message: 'Error fetching entry' })
    );
});

// PUT /api/journal/:id - Update a journal entry
router.put('/:id', (req, res) => {
  const { content, title, journalMood } = req.body;
  const userId = req.userId;

  prisma.journalEntry.update({
    where: { id: req.params.id },
    data: {
      ...(title && { title }),
      ...(content && { content }),
      ...(journalMood !== undefined && { journalMood }),
    },
  })
  .then(updatedEntry => {
    // Track word frequencies for sentiment analysis if content was updated
    if (content) {
      updateWordFrequencies(userId, content)
        .catch(err => console.error('Error updating word frequencies:', err));
    }

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

      return res.json(updatedEntry);
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Error updating entry' });
  });
});

// DELETE /api/journal/:id - Delete journal entry
router.delete('/:id', (req, res) => {
  const userId = req.userId;

  prisma.journalEntry.delete({ where: { id: req.params.id } })
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

      return res.json({ message: 'Entry deleted successfully' });
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ message: 'Error deleting entry' });
  });
});

module.exports = router;
