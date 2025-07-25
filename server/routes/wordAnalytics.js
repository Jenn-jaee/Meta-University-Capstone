const express = require('express');
const { PrismaClient } = require('@prisma/client');
const checkAuth = require('../middleware/checkAuth');
const { STATUS } = require('../constants');
const { getTopWords, getUserSentimentProfile } = require('../utils/wordFrequencyTracker');

const router = express.Router();
const prisma = new PrismaClient();

router.use(checkAuth);

/**
 * GET /api/word-analytics/top-words
 * Returns the user's most frequently used words
 */
router.get('/top-words', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.userId;

    const topWords = await getTopWords(userId, parseInt(limit));

    return res.json({ topWords });
  } catch (error) {
    return res.status(STATUS.SERVER_ERROR).json({
      error: 'Failed to fetch word analytics'
    });
  }
});

/**
 * GET /api/word-analytics/sentiment-profile
 * Returns the user's sentiment profile based on word usage
 */
router.get('/sentiment-profile', async (req, res) => {
  try {
    const userId = req.userId;

    const profile = await getUserSentimentProfile(userId);

    return res.json(profile);
  } catch (error) {
    return res.status(STATUS.SERVER_ERROR).json({
      error: 'Failed to fetch sentiment profile'
    });
  }
});

/**
 * GET /api/word-analytics/word-cloud
 * Returns data formatted for a word cloud visualization
 */
router.get('/word-cloud', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const userId = req.userId;

    const words = await prisma.userWordFrequency.findMany({
      where: { userId },
      orderBy: { frequency: 'desc' },
      take: parseInt(limit),
      select: {
        word: true,
        frequency: true,
        sentiment: true,
      },
    });

    // Format for word cloud visualization
    const wordCloudData = words.map(item => ({
      text: item.word,
      value: item.frequency,
      sentiment: item.sentiment || 0,
    }));

    return res.json({ wordCloudData });
  } catch (error) {
    return res.status(STATUS.SERVER_ERROR).json({
      error: 'Failed to fetch word cloud data'
    });
  }
});

module.exports = router;
