import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance.js';
import JournalForm from '../components/JournalForm.jsx';
import JournalList from '../components/JournalList.jsx';
import { STATUS } from '../api/axiosInstance.js';
import { checkAndGrowPlant } from '../services/plantService';
import isToday from 'date-fns/isToday';
import toast from 'react-hot-toast';

import '../components/Journal.css';

function JournalPage() {
  const [entries, setEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    fetchEntries();
  }, [navigate]);

  /* -------- Fetch all journal entries -------- */
  const fetchEntries = () => {
    axios
      .get('/api/journal')
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
      });
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
          toast.error('Unable to save your entry. Please try again.');
        }
      })
      .catch(() =>
        toast.error('Unable to save your entry. Please try again.')
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
          toast.error('Unable to delete entry. Please try again.');
        }
      })
      .catch(() =>
        toast.error('Unable to delete entry. Please try again.')
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
      <JournalForm
        onSubmit={handleSubmit}
        editingEntry={editingEntry}
        onCancel={() => setEditingEntry(null)}
      />
      <JournalList
        entries={entries}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

export default JournalPage;
