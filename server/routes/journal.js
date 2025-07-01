const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');

const router = express.Router();
const prisma = new PrismaClient();

//All journal routes require authentication
router.use(checkAuth);

// GET /api/journal - Get all journal entries for user
router.get('/journal', async (req, res) => {
  try {
    const entries = await prisma.journalEntry.findMany({
      where: {userId: req.userId},
      orderBy: {createdAt: 'desc'},
      include: {mood: true},
    });
    res.json(entries);

  }catch(error){
    console.error('Error fetching entries', error);
    res.status(500).json({message: 'Error fetching entries'});
  }
});


// POST /api/journal - Create a new journal entry
router.post('/journal', async (req, res) => {
    try {
      const { content, moodValue, title } = req.body;
      console.debug('Received moodValue:', moodValue); // For debugging

      let moodId = null;

      // 1. Create mood separately if moodValue is provided
      if (moodValue !== undefined) {
        const mood = await prisma.mood.create({
          data: {
            value: moodValue,
            userId: req.userId,
          },
        });
        moodId = mood.id;
      }

      // 2. Create journal entry and connect moodId
      const entry = await prisma.journalEntry.create({
        data: {
          title: title || 'Untitled Entry',
          content,
          userId: req.userId,
          moodId,
        },
        include: { mood: true },
      });

      res.json(entry);
    } catch (error) {
      console.error('Error creating entry', error);
      res.status(500).json({ message: 'Error creating entry' });
    }
  });


//GET /api/journal/:id - Get a single journal entry
router.get('/journal/:id', async (req, res) => {
    try{
        const entry = await prisma.journalEntry.findFirst({
            where: {id: req.params.id, userId: req.userId}, include: {mood: true}
        });

        if(!entry){
            return res.status(404).json({message: 'Entry not found'});
        }
        res.json(entry);
    }catch(error){
        console.error('Error fetching entry', error);
        res.status(500).json({message: 'Error fetching entry'});
    }
});

//PUT /api/journal/:id - Update a single journal entry
router.put('/journal/:id', async (req, res) => {
    try{
        const { content, title, moodValue } = req.body;

        //update entry
        const entry = await prisma.journalEntry.update({
            where: { id: req.params.id },
            data: {
              ...(title && { title }),
              ...(content && { content }),
            },
            include: { mood: true },
          });

        console.debug(entry.mood) // For debugging
        //update or create mood if provided
        if (moodValue !== undefined) {
            if (entry.mood) {
                await prisma.mood.update({
                    where: {id: entry.mood.id},
                    data: {value: moodValue},
                });
            }else{
                await prisma.mood.create({
                    data: {
                        value: moodValue,
                        userId: req.userId,
                        journalEntryId: entry.id}
                });
            }
        }
        // Fetch updated entry
        const updatedEntry = await prisma.journalEntry.findUnique({
            where: {id: req.params.id},
            include: {mood: true},
        });
        res.json(updatedEntry);
    }catch(error){
        console.error('Error updating entry:', error.message);
        console.error(error); // Full PrismaClientKnownRequestError
        res.status(500).json({ message: 'Error updating entry', error: error.message });
    }
});

// DELETE /api/journal/:id - Delete journal entry
router.delete('/journal/:id', async (req, res) => {
    try {
      // Find the journal entry to get its moodId (if any)
      const entry = await prisma.journalEntry.findUnique({
        where: { id: req.params.id },
        include: { mood: true },
      });

      // Delete associated mood first (if it exists)
      if (entry?.mood) {
        await prisma.mood.delete({
          where: { id: entry.mood.id },
        });
      }

      // Delete entry
      await prisma.journalEntry.delete({
        where: { id: req.params.id },
      });

      res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting entry:', error);
      res.status(500).json({ message: 'Error deleting entry' });
    }
  });


module.exports = router;
