import './Journal.css';

function JournalEntry({ entry, onEdit, onDelete }) {
    console.debug("Journal Entry:", entry);//for debugging

    const getMoodEmoji = (value) => {
        const moodEmojis = {
          5: '😊',     // happy
          4: '🤩',     // excited
          3: '😐',     // neutral
          2: '😰',     // anxious
          1: '😢',     // sad
          0: '😠'      // angry
        };
        return moodEmojis[value] || '😐';
      };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="journal-entry">
      <div className="entry-header">
        <div className="entry-title-section">
          <h3 className="entry-title">
            <span className="entry-mood">{getMoodEmoji(entry.mood?.value)}</span>
            {entry.title}
          </h3>
          <p className="entry-date">{formatDate(entry.createdAt)}</p>
        </div>
        <div className="entry-actions">
          <button
            onClick={() => onEdit(entry)}
            className="edit-button"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="delete-button"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="entry-content">{entry.content}</p>
    </div>
  );
}

export default JournalEntry;
