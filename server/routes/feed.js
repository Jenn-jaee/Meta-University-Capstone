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

  // Get all connections for the current user
  prisma.connection.findMany({
    where: {
      OR: [
        { userAId: userId },
        { userBId: userId }
      ]
    },
    select: {
      userAId: true,
      userBId: true
    }
  })
  .then(connections => {
    // Extract the IDs of connected users
    const connectionIds = connections.map(conn =>
      conn.userAId === userId ? conn.userBId : conn.userAId
    );

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
        if (!userSettings.sharingEnabled) return false;

        if (type === 'MOOD') return userSettings.shareMood;
        if (type === 'JOURNAL') return userSettings.shareJournal;
        if (type === 'HABIT') return userSettings.shareHabit;
        return false;
      };

      // Use the cursor for pagination
      const cursorDate = cursor;

      // Get mood logs
      const moodLogsPromise = prisma.moodLog.findMany({
        where: {
          userId: { in: connectionIds },
          createdAt: { lt: cursorDate }
        },
        select: {
          id: true,
          userId: true,
          note: true,
          mood: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get journal entries
      const journalEntriesPromise = prisma.journalEntry.findMany({
        where: {
          userId: { in: connectionIds },
          createdAt: { lt: cursorDate }
        },
        select: {
          id: true,
          userId: true,
          content: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      });

      // Get habit logs
      const habitLogsPromise = prisma.habitLog.findMany({
        where: {
          completed: true,
          date: { lt: cursorDate },
          habit: {
            userId: { in: connectionIds }
          }
        },
        select: {
          id: true,
          date: true,
          habit: {
            select: {
              userId: true,
              title: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      // Execute all queries in parallel
      return Promise.all([moodLogsPromise, journalEntriesPromise, habitLogsPromise])
        .then(([moodLogs, journalEntries, habitLogs]) => {
          // Transform the results to match the expected format
          const transformedMoodLogs = moodLogs.map(log => ({
            id: log.id,
            userId: log.userId,
            type: 'MOOD',
            content: log.note,
            extra: log.mood,
            createdAt: log.createdAt
          }));

          const transformedJournalEntries = journalEntries.map(entry => ({
            id: entry.id,
            userId: entry.userId,
            type: 'JOURNAL',
            content: entry.content,
            extra: null,
            createdAt: entry.createdAt
          }));

          const transformedHabitLogs = habitLogs.map(log => ({
            id: log.id,
            userId: log.habit.userId,
            type: 'HABIT',
            content: log.habit.title,
            extra: null,
            createdAt: log.date
          }));

          // Combine all results
          const raw = [
            ...transformedMoodLogs,
            ...transformedJournalEntries,
            ...transformedHabitLogs
          ].sort((a, b) => b.createdAt - a.createdAt)
           .slice(0, PAGE_LIMIT + 1);
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
