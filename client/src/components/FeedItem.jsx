import { useState } from 'react';
import { getMoodName } from '../utils/moodUtils';
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

// Using the imported getMoodName function from moodUtils.js

const CONTENT_TRUNCATE_LENGTH = 150;
const DEFAULT_AVATAR = '/plantStages/plantstage-0.svg';
const FALLBACK_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e0e0e0'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dy='.3em' fill='%23757575'%3E%3F%3C/text%3E%3C/svg%3E";

function FeedItem({ item }) {
  const [expanded, setExpanded] = useState(false);
  const isLongContent = item.content && item.content.length > CONTENT_TRUNCATE_LENGTH;

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Convert emoji to mood value and then get the mood name
  const getMoodNameFromEmoji = (emoji) => {
    // Map emojis to their numeric values
    const emojiToValue = {
      '😢': 1, // Sad
      '😟': 2, // Troubled
      '😐': 3, // Neutral
      '😊': 4, // Happy
      '🤩': 5, // Excited
      '😁': 4, // Grinning face (old Happy emoji)
      '😄': 5  // Smiling face with open mouth (old Excited emoji)
    };

    // Get the mood value from the emoji
    const moodValue = emojiToValue[emoji] || 3;

    // Use the imported getMoodName function to get the mood name
    return getMoodName(moodValue);
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
              <span className="feed-item-mood-text">~ feeling {getMoodNameFromEmoji(item.moodEmoji)}</span>
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
