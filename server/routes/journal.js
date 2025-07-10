const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

// GET /api/journal - Get all journal entries for user
router.get('/journal', async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(entries);
  } catch (error) {
    console.error('Error fetching entries', error);
    res.status(500).json({ message: 'Error fetching entries' });
  }
});

// POST /api/journal - Create a new journal entry
router.post('/journal', async (req, res) => {
  try {
    const { content, title, journalMood } = req.body;

    const entry = await prisma.journalEntry.create({
      data: {
        title: title || 'Untitled Entry',
        content,
        journalMood,
        userId: req.userId
      }
    });

    res.json(entry);
  } catch (error) {
    console.error('Error creating entry', error);
    res.status(500).json({ message: 'Error creating entry' });
  }
});

// GET /api/journal/:id - Get a single journal entry
router.get('/journal/:id', async (req, res) => {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    console.error('Error fetching entry', error);
    res.status(500).json({ message: 'Error fetching entry' });
  }
});

// PUT /api/journal/:id - Update a journal entry
router.put('/journal/:id', async (req, res) => {
  try {
    const { content, title, journalMood } = req.body;

    const updatedEntry = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(journalMood !== undefined && { journalMood })
      }
    });

    res.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ message: 'Error updating entry' });
  }
});

// DELETE /api/journal/:id - Delete journal entry
router.delete('/journal/:id', async (req, res) => {
  try {
    await prisma.journalEntry.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Error deleting entry' });
  }
});

module.exports = router;
