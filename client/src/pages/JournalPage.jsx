import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axiosInstance.js';
import JournalForm from '../components/JournalForm.jsx';
import JournalList from '../components/JournalList.jsx';
import { STATUS } from '../constants/statusCodes.js';
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
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    fetchEntries();
  }, [navigate]);

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
        console.error('Error fetching entries:', error);
        if (error.response?.status === STATUS.NOT_AUTHORIZED) {
          localStorage.removeItem('token');
          navigate('/');
        }
      });
  };

  const handleSubmit = (entryData) => {
    const request = editingEntry
      ? axios.put(`/api/journal/${editingEntry.id}`, entryData)
      : axios.post('/api/journal', entryData);

    request
      .then((response) => {
        if (response.status === STATUS.SUCCESS) {
          fetchEntries();
          setEditingEntry(null);
        } else {
            console.error('Request failed with status:', response.status); // Log the error status
            alert('Something went wrong while saving your entry. Please try again.');
        }
      })
      .catch((error) => {
        console.error('Error saving entry:', error);
        alert('Something went wrong while saving your entry. Please try again.');
      });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      axios
        .delete(`/api/journal/${id}`)
        .then((response) => {
          if (response.status === STATUS.SUCCESS) {
            fetchEntries();
          }
        })
        .catch((error) => {
          console.error('Error deleting entry:', error);
          alert('Something went wrong while deleting. Please try again.');
        });
    }
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
