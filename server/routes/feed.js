const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/checkAuth');
const { PrismaClient } = require('@prisma/client');
const { STATUS } = require('../constants');
const cache = require('../utils/cache');

const prisma = new PrismaClient();
const PAGE_LIMIT = 10;

/*
 * Main feed endpoint with pagination support
 * GET /api/feed?cursor=ISO8601
 * Returns feed items from user's connections, respecting privacy settings
 */
router.get('/', checkAuth, (req, res) => {
  const userId = req.userId;
  const cursor = req.query.cursor
    ? new Date(req.query.cursor)
    : new Date(); // Default to current time for first page

  // Process feed request with pagination

  // Generate cache key based on whether this is first page or paginated request
  const cacheKey = req.query.cursor
    ? `feed:${userId}:cursor:${cursor.toISOString()}`
    : `feed:${userId}:first`;

  // Return cached response if available
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.status(STATUS.SUCCESS).json(cached);
  }

  prisma.$queryRaw`
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

    // Return empty feed if user has no connections
    if (connectionIds.length === 0) {
      return res.status(STATUS.SUCCESS).json({ items: [], nextCursor: null });
    }

    return prisma.shareSettings.findMany({
      where: { userId: { in: connectionIds } },
    })
    .then(settings => {
      // Helper function to check if content should be shown based on privacy settings
      const canShow = (uid, type) => {
        const userSettings = settings.find((s) => s.userId === uid);
        if (!userSettings) return true; // Default to sharing everything if no settings found

        // If master toggle is off, don't share anything
        if (userSettings.sharingEnabled === false) return false;

        if (type === 'MOOD') return userSettings.shareMood;
        if (type === 'JOURNAL') return userSettings.shareJournal;
        if (type === 'HABIT') return userSettings.shareHabit;
        return false;
      };

      // Use the cursor for pagination
      const cursorTimestamp = cursor.toISOString();

      return prisma.$queryRaw`
        SELECT * FROM (
          SELECT id, "userId", 'MOOD' AS type, note AS content, mood AS extra, "createdAt"
          FROM "MoodLog"
          WHERE "userId" = ANY(${connectionIds})

          UNION ALL

          SELECT id, "userId", 'JOURNAL' AS type, content, NULL AS extra, "createdAt"
          FROM "JournalEntry"
          WHERE "userId" = ANY(${connectionIds})

          UNION ALL

          SELECT HL.id, H."userId", 'HABIT' AS type, H.title AS content, NULL AS extra, HL."date" AS "createdAt"
          FROM "HabitLog" HL
          JOIN "Habit" H ON H.id = HL."habitId"
          WHERE H."userId" = ANY(${connectionIds})
            AND HL."completed" = true
        ) AS unioned
        WHERE "createdAt" < ${cursorTimestamp}::timestamp
        ORDER BY "createdAt" DESC
        LIMIT ${PAGE_LIMIT + 1};
      `
      .then(raw => {
        // Filter results based on privacy settings
        const filtered = raw.filter((item) => canShow(item.userId, item.type));

        // Apply pagination and determine next cursor
        const items = filtered.slice(0, PAGE_LIMIT);
        const nextCursor = filtered.length > PAGE_LIMIT
          ? filtered[PAGE_LIMIT].createdAt
          : null;

        const payload = { items, nextCursor };

        // Store in cache for future requests
        cache.set(cacheKey, payload);

        return res.status(STATUS.SUCCESS).json(payload);
      });
    });
  })
  .catch(() => {
    return res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to load feed' });
  });
});

module.exports = router;
