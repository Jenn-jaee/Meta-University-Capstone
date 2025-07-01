import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import JournalForm from '../components/JournalForm.jsx';
import JournalList from '../components/JournalList.jsx';
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

  // Journal Logic
  const fetchEntries = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/journal');
      setEntries(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching entries:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      }
    }
  };

  const handleSubmit = async (entryData) => {
    console.log("Sending entry data:", entryData); // For debugging purposes

    try {
      if (editingEntry) {
        await axios.put(`http://localhost:3001/api/journal/${editingEntry.id}`, entryData);
        setEditingEntry(null);
      } else {
        await axios.post('http://localhost:3001/api/journal', entryData);
      }
      fetchEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await axios.delete(`http://localhost:3001/api/journal/${id}`);
        fetchEntries();
      } catch (error) {
        console.error('Error deleting entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
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
