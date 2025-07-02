import JournalEntry from './JournalEntry';
import './Journal.css';

function JournalList({ entries, onEdit, onDelete }) {
  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-message">
          No journal entries yet. Start writing to capture your thoughts!
        </p>
      </div>
    );
  }

  return (
    <div className="journal-list">
      <h2 className="list-title">Your Journal Entries</h2>
      <div className="entries-container">
        {entries.map((entry) => (
          <JournalEntry
            key={entry.id}
            entry={entry}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default JournalList;
