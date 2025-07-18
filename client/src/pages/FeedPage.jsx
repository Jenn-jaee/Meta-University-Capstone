import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import './FeedPage.css';
import { getFeedItems, loadMoreFeedItems } from '../api/feedAPI';
import FeedItem from '../components/FeedItem';
import { BASE_URL } from '../api/axiosInstance';

// Constants
const ERROR_MESSAGES = {
  LOAD_FEED: 'Failed to load feed items',
  LOAD_MORE: 'Failed to load more feed items'
};

const FEED_TEXTS = {
  HEADING: 'Your Wellness Feed',
  SUBTEXT: 'Updates from your connected community.',
  LOADING: 'Loading your feed...',
  EMPTY_MESSAGE: 'Your feed is quiet for now. When your friends share updates, they\'ll appear here.',
  LOAD_MORE: 'Load More',
  LOADING_MORE: 'Loading...'
};

function FeedPage() {
  const [feedItems, setFeedItems] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  const loadInitialFeedItems = async () => {
    try {
      setLoading(true);
      const response = await getFeedItems();
      setFeedItems(response.items);
      setNextCursor(response.nextCursor);
      setLoading(false);
    } catch (err) {
      setError(ERROR_MESSAGES.LOAD_FEED);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialFeedItems();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      const userId = decodedPayload.userId || decodedPayload.id;

      if (!userId) return;

      const socket = io(BASE_URL);

      socket.on(`feed:update:${userId}`, () => {
        loadInitialFeedItems();
      });

      return () => {
        socket.disconnect();
      };
    } catch (error) {
      // Silent fail - WebSocket is non-critical
    }
  }, []);

  const handleLoadMore = async () => {
    if (!nextCursor || loadingMore) return;

    try {
      setLoadingMore(true);
      const response = await loadMoreFeedItems(nextCursor);

      // Filter out any duplicate items by ID
      setFeedItems(prevItems => {
        const existingIds = new Set(prevItems.map(item => item.id));
        const newItems = response.items.filter(item => !existingIds.has(item.id));
        return [...prevItems, ...newItems];
      });

      setNextCursor(response.nextCursor);
      setLoadingMore(false);
    } catch (err) {
      setError(ERROR_MESSAGES.LOAD_MORE);
      setLoadingMore(false);
    }
  };

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h2 className="feed-heading">{FEED_TEXTS.HEADING}</h2>
        <p className="feed-subtext">{FEED_TEXTS.SUBTEXT}</p>
      </div>

      {loading ? (
        <div className="feed-loading">
          <p>{FEED_TEXTS.LOADING}</p>
        </div>
      ) : error ? (
        <div className="feed-error">
          <p>{error}</p>
        </div>
      ) : feedItems.length > 0 ? (
        <>
          <div className="feed-items-container">
            {feedItems.map((item) => (
              <FeedItem key={item.id} item={item} />
            ))}
          </div>

          {nextCursor && (
            <div className="feed-load-more">
              <button
                className="feed-load-more-button"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? FEED_TEXTS.LOADING_MORE : FEED_TEXTS.LOAD_MORE}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="feed-empty-state">
          <div className="feed-empty-emoji">🌱</div>
          <p className="feed-empty-message">
            {FEED_TEXTS.EMPTY_MESSAGE}
          </p>
        </div>
      )}
    </div>
  );
}

export default FeedPage;
