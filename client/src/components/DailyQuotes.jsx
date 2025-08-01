import { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import './DailyQuotes.css'

function DailyQuote({ mood }) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMood, setCurrentMood] = useState(null);

  // Valid moods we support
  const validMoods = ['sad', 'troubled', 'neutral', 'happy', 'excited'];

  // When mood prop changes, update the currentMood state
  useEffect(() => {
    if (mood && validMoods.includes(mood)) {
      // User has logged a mood today, use it
      setCurrentMood(mood);
    } else {
      // No mood logged today, select a random mood
      const randomIndex = Math.floor(Math.random() * validMoods.length);
      const randomMood = validMoods[randomIndex];
      setCurrentMood(randomMood);
    }
  }, [mood]);

  // Fetch quote when currentMood changes
  useEffect(() => {
    if (!currentMood) return; // Wait until we have a mood

    setLoading(true);
    const endpoint = `/api/quotes/by-mood/${currentMood}`;

    axiosInstance.get(endpoint)
      .then(res => {
        setQuote(res.data);
        setLoading(false);
      })
      .catch(() => {
        // Error handling is done by axios interceptor
        setQuote(null);
        setLoading(false);
      });
  }, [currentMood]);

  if (loading) return <div className="quote-card-loading">Loading inspiration...</div>;
  if (!quote) return <div className="quote-card">Seeking wisdom for you...</div>;

  return (
    <div className="quote-card" data-mood={currentMood}>
      <p className="quote-text">"{quote.quote}"</p>
      <p className="quote-author">— {quote.author}</p>
      <div className="quote-mood-indicator" title={mood ? `Based on your ${currentMood} mood` : 'Daily inspiration'}></div>
    </div>
  );
}

export default DailyQuote;
