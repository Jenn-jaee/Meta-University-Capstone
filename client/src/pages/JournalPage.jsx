import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../api/axiosInstance.js';
import JournalForm from '../components/JournalForm.jsx';
import JournalList from '../components/JournalList.jsx';
import JournalSearch from '../components/JournalSearch.jsx';
import { STATUS } from '../api/axiosInstance.js';
import { checkAndGrowPlant } from '../services/plantService';
import { getRandomJournalMessage } from '../utils/journalMessages';
import isToday from 'date-fns/isToday';
import toast from 'react-hot-toast';
import '../components/Journal.css';

/* ------- toast constants ----- */
const SAVE_ENTRY_ERROR = 'Unable to save your entry. Please try again.';
const DELETE_ENTRY_ERROR = 'Unable to delete entry. Please try again.';

function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journalMessage, setJournalMessage] = useState("");
  const [searchActive, setSearchActive] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();

  // Set a random journal message when the component mounts
  useEffect(() => {
    setJournalMessage(getRandomJournalMessage());
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchEntries();
  }, [navigate]);

  // Handle viewing or editing a specific entry based on URL params
  useEffect(() => {
    if (id && entries.length > 0) {
      const currentPath = window.location.pathname;
      const entry = entries.find(e => e.id === id);

      if (entry) {
        if (currentPath.includes('/edit/')) {
          // Edit mode
          setEditingEntry(entry);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          // View mode - scroll to the entry
          const entryElement = document.getElementById(`journal-entry-${id}`);
          if (entryElement) {
            entryElement.scrollIntoView({ behavior: 'smooth' });
            // Add a highlight effect
            entryElement.classList.add('highlight-entry');
            setTimeout(() => {
              entryElement.classList.remove('highlight-entry');
            }, 2000);
          }
        }
      }
    }
  }, [id, entries]);

  /* -------- Fetch all journal entries -------- */
  const fetchEntries = (params = {}) => {
    setLoading(true);

    // Check if we're performing a search
    const isSearching = Object.values(params).some(value => value !== undefined);
    setSearchActive(isSearching);

    axios
      .get('/api/journal', { params })
      .then((response) => {
        if (response.status === STATUS.SUCCESS) {
          setEntries(response.data);
          setLoading(false);
        }
      })
      .catch((error) => {
        if (error.response?.status === STATUS.NOT_AUTHORIZED) {
          localStorage.removeItem('token');
          navigate('/');
        } else {
          toast.error('Unable to load journal entries.');
        }
        setLoading(false);
      });
  };

  /* -------- Handle search -------- */
  const handleSearch = (params) => {
    fetchEntries(params);
  };

  /* -------- Create or update a journal entry -------- */
  const handleSubmit = (entryData) => {
    const request = editingEntry
      ? axios.put(`/api/journal/${editingEntry.id}`, entryData)
      : axios.post('/api/journal', entryData);

    request
      .then((response) => {
        if (response.status === STATUS.SUCCESS) {
          fetchEntries();
          setEditingEntry(null);

          // Trigger growth only if this is the first journal today
          const alreadyLoggedToday = entries.some((e) =>
            isToday(new Date(e.createdAt))
          );
          if (!alreadyLoggedToday) {
            checkAndGrowPlant();
          }
        } else {
          toast.error(SAVE_ENTRY_ERROR);
        }
      })
      .catch(() =>
        toast.error(SAVE_ENTRY_ERROR)
      );
  };

  /* -------- Edit handler -------- */
  const handleEdit = (entry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* -------- Delete a journal entry -------- */
  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;

    axios
      .delete(`/api/journal/${id}`)
      .then((response) => {
        if (response.status === STATUS.SUCCESS) {
          fetchEntries();
        } else {
          toast.error(DELETE_ENTRY_ERROR);
        }
      })
      .catch(() =>
        toast.error(DELETE_ENTRY_ERROR)
      );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your journal...</p>
      </div>
    );
  }

  return (
    <div className="journal-page">
      <div className="journal-header">
        <h1 className="journal-main-title">
          <span className="journal-title-icon">📓</span>
          My Journal
        </h1>
        <p className="journal-subtitle">
          <span className="journal-subtitle-icon">✨</span>
          {journalMessage}
        </p>
      </div>

      {/* Form first, then entries */}
      <div className="journal-form-section">
        <JournalForm
          onSubmit={handleSubmit}
          editingEntry={editingEntry}
          onCancel={() => setEditingEntry(null)}
        />
      </div>

      {/* Search component */}
      <div className="journal-search-section">
        <JournalSearch onSearch={handleSearch} />

        {searchActive && (
          <div className="search-results-count">
            Found {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            <button
              className="clear-search-button"
              onClick={() => handleSearch({})}
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      <div className={`journal-entries-section ${searchActive ? 'active-search' : ''}`}>
        <JournalList
          entries={entries}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default JournalPage;
