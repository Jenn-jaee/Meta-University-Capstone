import JournalEntry from './JournalEntry';
import './Journal.css';

function JournalList({ entries, onEdit, onDelete }) {
  // Group entries by date
  const groupEntriesByDate = () => {
    const groups = {};

    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format

      if (!groups[dateKey]) {
        groups[dateKey] = {
          displayDate: date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          entries: []
        };
      }

      groups[dateKey].entries.push(entry);
    });

    // Sort dates in descending order (newest first)
    return Object.keys(groups)
      .sort((a, b) => new Date(b) - new Date(a))
      .map(key => groups[key]);
  };

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-message">
          No journal entries yet. Start writing to capture your thoughts!
        </p>
      </div>
    );
  }

  const groupedEntries = groupEntriesByDate();

  return (
    <div className="journal-list">
      <h2 className="list-title">Your Journal Entries</h2>

      <div className="entries-by-date">
        {groupedEntries.map((group, index) => (
          <div key={index} className="entry-date-group">
            <h3 className="entry-date-heading">{group.displayDate}</h3>
            <div className="entries-container">
              {group.entries.map((entry) => (
                <JournalEntry
                  key={entry.id}
                  entry={entry}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JournalList;
