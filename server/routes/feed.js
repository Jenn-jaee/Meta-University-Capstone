const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const { PrismaClient } = require('@prisma/client');
const { STATUS } = require('../constants');

const prisma = new PrismaClient();
const PAGE_LIMIT = 10;

// Main feed endpoint with pagination support
// GET /api/feed?cursor=ISO8601
router.get('/', checkAuth, async (req, res) => {
  const userId = req.userId;
  const cursor = req.query.cursor
    ? new Date(req.query.cursor)
    : new Date(); // Default to current time for first page

  try {
    // Step 1: Collect mutual connections for the current user
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

    // Return empty feed if user has no connections
    if (connectionIds.length === 0) {
      return res.status(STATUS.SUCCESS).json({ items: [], nextCursor: null });
    }

    // Step 2: Fetch privacy settings for all connected users
    const settings = await prisma.shareSettings.findMany({
      where: { userId: { in: connectionIds } },
    });

    // Helper function to check if content should be shown based on privacy settings
    const canShow = (uid, type) => {
      const userSettings = settings.find((s) => s.userId === uid);
      if (!userSettings) return true; // Default to sharing everything if no settings found

      if (type === 'MOOD') return userSettings.shareMood;
      if (type === 'JOURNAL') return userSettings.shareJournal;
      if (type === 'HABIT') return userSettings.shareHabit;
      return false;
    };

    // Step 3: Execute union query to fetch all feed content types
    const raw = await prisma.$queryRaw`
      SELECT * FROM (
        SELECT id, "userId", 'MOOD' AS type, note AS content, mood AS extra, "createdAt"
        FROM "MoodLog"
        WHERE "userId" = ANY(${connectionIds}) AND "createdAt" < ${cursor}

        UNION ALL

        SELECT id, "userId", 'JOURNAL' AS type, content, NULL AS extra, "createdAt"
        FROM "JournalEntry"
        WHERE "userId" = ANY(${connectionIds}) AND "createdAt" < ${cursor}

        UNION ALL

        SELECT HL.id, H."userId", 'HABIT' AS type, H.title AS content, NULL AS extra, HL."date" AS "createdAt"
        FROM "HabitLog" HL
        JOIN "Habit" H ON H.id = HL."habitId"
        WHERE H."userId" = ANY(${connectionIds})
          AND HL."date" < ${cursor}
          AND HL."completed" = true
      ) AS unioned
      ORDER BY "createdAt" DESC
      LIMIT ${PAGE_LIMIT + 1};
    `;

    // Step 4: Filter results based on privacy settings
    const filtered = raw.filter((item) => canShow(item.userId, item.type));

    // Step 5: Apply pagination and determine next cursor
    const items = filtered.slice(0, PAGE_LIMIT);
    const nextCursor = filtered.length > PAGE_LIMIT ? filtered[PAGE_LIMIT].createdAt : null;

    return res.status(STATUS.SUCCESS).json({ items, nextCursor });
  } catch (error) {
    console.error('Error loading feed:', error);
    return res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to load feed' });
  }
});

module.exports = router;
