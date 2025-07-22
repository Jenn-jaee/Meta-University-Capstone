import { useState } from 'react';
import './FeedItem.css';

// Constants
const CONTENT_TYPES = {
  MOOD: 'MOOD',
  JOURNAL: 'JOURNAL',
  HABIT: 'HABIT'
};

const ITEM_LABELS = {
  MOOD: 'Shared a mood',
  JOURNAL: 'Journal entry',
  HABIT: 'Completed a habit'
};

const TOGGLE_LABELS = {
  SHOW_MORE: 'Show more',
  SHOW_LESS: 'Show less'
};

const MOOD_EMOJIS = {
  '😢': 'Sad',
  '😐': 'Neutral',
  '😊': 'Content',
  '😁': 'Happy',
  '😄': 'Excited'
};

const CONTENT_TRUNCATE_LENGTH = 150;
const DEFAULT_AVATAR = '/plantStages/plantstage-0.svg';
const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dy='.3em' fill='%23757575'%3E%3F%3C/text%3E%3C/svg%3E";

function FeedItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = item.content && item.content.length > CONTENT_TRUNCATE_LENGTH;

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const getMoodName = (emoji) => {
    return MOOD_EMOJIS[emoji] || '';
  };

  const renderTruncatedContent = (content) => {
    if (!content) return null;

    return (
      <>
        <p>
          {expanded || !isLongContent
            ? content
            : `${content.substring(0, CONTENT_TRUNCATE_LENGTH)}...`}
        </p>
        {isLongContent && (
          <button
            className="feed-item-toggle"
            onClick={toggleExpanded}
          >
            {expanded ? TOGGLE_LABELS.SHOW_LESS : TOGGLE_LABELS.SHOW_MORE}
          </button>
        )}
      </>
    );
  };

  const renderContent = () => {
    switch (item.type) {
      case CONTENT_TYPES.MOOD:
        return (
          <>
            <div className="feed-item-type-label">{ITEM_LABELS.MOOD}</div>
            <div className="feed-item-mood">
              <span className="feed-item-mood-emoji">{item.moodEmoji}</span>
              <span className="feed-item-mood-text">~ feeling {getMoodName(item.moodEmoji)}</span>
            </div>
            {item.content && (
              <div className="feed-item-journal">
                {renderTruncatedContent(item.content)}
              </div>
            )}
          </>
        );

      case CONTENT_TYPES.JOURNAL:
        return (
          <>
            <div className="feed-item-type-label">{ITEM_LABELS.JOURNAL}</div>
            <div className="feed-item-journal">
              {renderTruncatedContent(item.content)}
            </div>
          </>
        );

      case CONTENT_TYPES.HABIT:
        return (
          <>
            <div className="feed-item-type-label">{ITEM_LABELS.HABIT}</div>
            <div className="feed-item-habit">
              <span className="feed-item-habit-icon">✅</span>
              <span className="feed-item-habit-title">{item.content}</span>
            </div>
          </>
        );

      default:
        return (
          <div className="feed-item-journal">
            <p>{item.content}</p>
          </div>
        );
    }
  };

  return (
    <div className="feed-item">
      <div className="feed-item-header">
        <img
          src={item.profilePhoto || DEFAULT_AVATAR}
          alt={`${item.displayName}'s profile`}
          className="feed-item-avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = FALLBACK_AVATAR;
          }}
        />
        <div className="feed-item-user-info">
          <h3 className="feed-item-name">{item.displayName}</h3>
          <span className="feed-item-timestamp">{item.timestamp}</span>
        </div>
      </div>

      <div className="feed-item-content">
        {renderContent()}
      </div>
    </div>
  );
}

export default FeedItem;
