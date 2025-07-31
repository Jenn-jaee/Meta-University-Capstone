const express = require('express');
const router = express.Router();
const quotesByMood = require('../utils/QuotesByMood');
const { STATUS } = require('../constants');

// Get a random quote
router.get('/random', (_, res) => {
  try {
    // Get all quotes from all moods
    const allQuotes = [];
    Object.values(quotesByMood).forEach(moodQuotes => {
      allQuotes.push(...moodQuotes);
    });

    // Select a random quote
    const randomIndex = Math.floor(Math.random() * allQuotes.length);
    const randomQuote = allQuotes[randomIndex];

    res.json({
      quote: randomQuote.quote,
      author: randomQuote.author
    });
  } catch (error) {
    res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to get random quote' });
  }
});

// Get a quote by mood
router.get('/by-mood/:mood', (req, res) => {
  try {
    const mood = req.params.mood.toLowerCase();

    // Check if the mood exists in our quotes collection
    if (!quotesByMood[mood]) {
      return res.status(STATUS.NOT_FOUND).json({ error: `No quotes found for mood: ${mood}` });
    }

    // Select a random quote for the specified mood
    const moodQuotes = quotesByMood[mood];
    const randomIndex = Math.floor(Math.random() * moodQuotes.length);
    const randomQuote = moodQuotes[randomIndex];

    res.json({
      quote: randomQuote.quote,
      author: randomQuote.author
    });
  } catch (error) {
    res.status(STATUS.SERVER_ERROR).json({ error: 'Failed to get quote by mood' });
  }
});


module.exports = router;
