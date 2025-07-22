const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { invalidateFeed } = require('../utils/invalidateFeed');

const prisma = new PrismaClient();
const router = express.Router();

router.use(checkAuth);

// PATCH /api/share-settings
router.patch('/', (req, res) => {
  const { sharingEnabled, shareMood, shareJournal, shareHabit } = req.body;
  const userId = req.userId;

  // Only include fields that were explicitly provided in the request
  const updateData = {};
  if (sharingEnabled !== undefined) updateData.sharingEnabled = sharingEnabled;
  if (shareMood !== undefined) updateData.shareMood = shareMood;
  if (shareJournal !== undefined) updateData.shareJournal = shareJournal;
  if (shareHabit !== undefined) updateData.shareHabit = shareHabit;

  prisma.shareSettings.upsert({
    where: { userId },
    update: updateData,
    create: {
      userId,
      sharingEnabled: sharingEnabled ?? true,
      shareMood: shareMood ?? true,
      shareJournal: shareJournal ?? true,
      shareHabit: shareHabit ?? true,
    },
  })
    .then((updatedSettings) => {
      // Get all users connected to this user
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
        // Extract connection IDs
        const connectionIds = connections.map(connection => connection.id);

        // Invalidate feed cache for this user and all connected users
        invalidateFeed(userId, connectionIds);

        res.json(updatedSettings);
      })
      .catch(() => {
        // Still return success even if cache invalidation fails
        res.json(updatedSettings);
      });
    })
    .catch(() => {
      res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to update sharing settings.' });
    });
});

// GET /api/share-settings
router.get('/', (req, res) => {
  const userId = req.userId;

  prisma.shareSettings.findUnique({
    where: { userId },
  })
    .then((settings) => {
      if (!settings) {
        return res.status(STATUS.NOT_FOUND).json({ error: 'No sharing settings found.' });
      }
      res.json(settings);
    })
    .catch(() => {
      res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to fetch sharing settings.' });
    });
});


module.exports = router;
