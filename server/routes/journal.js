const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// GET /api/journal - Get all journal entries for user (optionally filter by date)
router.get('/', async (req, res) => {
  const { from } = req.query;
  const where = { userId: req.userId };

  if (from) where.createdAt = { gte: new Date(from) };

  prisma.journalEntry.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  .then((entries) => res.json(entries))
  .catch(() =>
    res.status(STATUS.SERVER_ERROR).json({ message: 'Error fetching entries' })
  );
});


// POST /api/journal - Create a new journal entry
router.post('/', (req, res) => {
  const { content, title, journalMood } = req.body;

  prisma.journalEntry
    .create({
      data: {
        title: title || 'Untitled Entry',
        content,
        journalMood,
        userId: req.userId,
      },
    })
    .then((entry) => res.json(entry))
    .catch(() =>
      res.status(STATUS.SERVER_ERROR).json({ message: 'Error creating entry' })
    );
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

  prisma.journalEntry
    .update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(journalMood !== undefined && { journalMood }),
      },
    })
    .then((updatedEntry) => res.json(updatedEntry))
    .catch(() =>
      res.status(STATUS.SERVER_ERROR).json({ message: 'Error updating entry' })
    );
});

// DELETE /api/journal/:id - Delete journal entry
router.delete('/:id', (req, res) => {
  prisma.journalEntry
    .delete({ where: { id: req.params.id } })
    .then(() =>
      res.json({ message: 'Entry deleted successfully' })
    )
    .catch(() =>
      res.status(STATUS.SERVER_ERROR).json({ message: 'Error deleting entry' })
    );
});

module.exports = router;
