import { useState } from 'react';
import { journalMoodOptions, journalMoodMap } from '../utils/journalMoodUtils';
import './JournalSearch.css';

function JournalSearch({ onSearch }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchText, setSearchText] = useState('');
  const [titleSearch, setTitleSearch] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();

    // Format dates to ensure they're properly handled
    let formattedStartDate = startDate || undefined;
    let formattedEndDate = endDate || undefined;

    // If we have an end date, ensure it's the full day
    if (formattedEndDate) {
      // No need to modify the date string - the backend will handle setting it to end of day
      // Just ensure we're sending a valid date string
      const dateObj = new Date(formattedEndDate);
      if (!isNaN(dateObj.getTime())) {
        formattedEndDate = dateObj.toISOString().split('T')[0];
      }
    }

    // Same validation for start date
    if (formattedStartDate) {
      const dateObj = new Date(formattedStartDate);
      if (!isNaN(dateObj.getTime())) {
        formattedStartDate = dateObj.toISOString().split('T')[0];
      }
    }

    const searchParams = {
      from: formattedStartDate,
      to: formattedEndDate,
      search: searchText || undefined,
      title: titleSearch || undefined,
      mood: selectedMood || undefined
    };

    onSearch(searchParams);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setSearchText('');
    setTitleSearch('');
    setSelectedMood('');
    onSearch({});
  };

  return (
    <div className="journal-search panel">
      <div className="search-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>
          <span className="search-icon">🔍</span> Search Journal Entries
        </h3>
        <button type="button" className="toggle-button">
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {isExpanded && (
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-row">
            <div className="search-field">
              <label htmlFor="searchText">Search in content:</label>
              <input
                type="text"
                id="searchText"
                placeholder="Search for words or phrases..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label htmlFor="titleSearch">Search in title:</label>
              <input
                type="text"
                id="titleSearch"
                placeholder="Search by title..."
                value={titleSearch}
                onChange={(e) => setTitleSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="search-row">
            <div className="search-field">
              <label htmlFor="startDate">From date:</label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="search-field">
              <label htmlFor="endDate">To date:</label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="search-row mood-filter-row">
            <div className="search-field mood-filter">
              <label>Filter by mood:</label>
              <div className="mood-filter-options">
                {journalMoodOptions.map((mood) => (
                  <label key={mood.value} className="mood-filter-option">
                    <input
                      type="radio"
                      name="moodFilter"
                      value={journalMoodMap[mood.value]}
                      checked={selectedMood === journalMoodMap[mood.value].toString()}
                      onChange={() => setSelectedMood(journalMoodMap[mood.value].toString())}
                    />
                    <span className="mood-filter-label">
                      <span className="mood-emoji">{mood.emoji}</span> {mood.label}
                    </span>
                  </label>
                ))}
                <label className="mood-filter-option">
                  <input
                    type="radio"
                    name="moodFilter"
                    value=""
                    checked={selectedMood === ''}
                    onChange={() => setSelectedMood('')}
                  />
                  <span className="mood-filter-label">All</span>
                </label>
              </div>
            </div>
          </div>

          <div className="search-actions">
            <button type="submit" className="search-button">Search</button>
            <button type="button" onClick={handleReset} className="reset-button">Reset</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default JournalSearch;
