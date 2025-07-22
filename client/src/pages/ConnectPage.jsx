import { useEffect, useState, useCallback } from 'react';
import './ConnectPage.css';
import axios from '../api/axiosInstance';
import UserCard from '../components/UserCard';

function ConnectPage() {
  const [suggested, setSuggested] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /*
   * Fetches all connection-related data including suggested users,
   * connections, incoming requests, and outgoing requests
   */
  const fetchConnectionData = useCallback(() => {
    setLoading(true);
    setError(null);

    // Use Promise.all to fetch data in parallel
    Promise.all([
      axios.get('/api/connections/suggested'),
      axios.get('/api/connections/me')
    ])
      .then(([suggestedRes, connectionsRes]) => {
        setSuggested(suggestedRes.data);
        setIncoming(connectionsRes.data.incoming || []);
        setOutgoing(connectionsRes.data.outgoing || []);
        setConnections(connectionsRes.data.connections || []);
      })
      .catch(err => {
        setError('Failed to load connection data. Please try again.');
        setSuggested([]);
        setIncoming([]);
        setOutgoing([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchConnectionData();
  }, [fetchConnectionData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading connections...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={fetchConnectionData}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="connect-page">
      <div className="connect-page-header">
        <h1>Connect with Others</h1>
        <button
          className="refresh-button"
          onClick={fetchConnectionData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      <section>
        <h2>My Connections {connections.length > 0 && `(${connections.length})`}</h2>
        <div className="user-grid">
          {connections.length > 0 ? (
            connections.map(user => (
              <UserCard
                key={user.id}
                user={user}
                type="connected"
                onActionComplete={fetchConnectionData}
              />
            ))
          ) : (
            <p>No connections yet. Connect with others to grow your network!</p>
          )}
        </div>
      </section>

      <section>
        <h2>Suggested Users {suggested.length > 0 && `(${suggested.length})`}</h2>
        <div className="user-grid">
          {suggested.length > 0 ? (
            suggested.map(user => (
              <UserCard
                key={user.id}
                user={user}
                type="suggested"
                onActionComplete={fetchConnectionData}
              />
            ))
          ) : (
            <p>No suggestions right now.</p>
          )}
        </div>
      </section>

      <section>
        <h2>Incoming Requests {incoming.length > 0 && `(${incoming.length})`}</h2>
        <div className="user-grid">
          {incoming.length > 0 ? (
            incoming.map(request => (
              <UserCard
                key={request.id}
                user={request.sender}
                type="incoming"
                requestId={request.id}
                onActionComplete={fetchConnectionData}
              />
            ))
          ) : (
            <p>No incoming requests.</p>
          )}
        </div>
      </section>

      <section>
        <h2>Outgoing Requests {outgoing.length > 0 && `(${outgoing.length})`}</h2>
        <div className="user-grid">
          {outgoing.length > 0 ? (
            outgoing.map(request => (
              <UserCard
                key={request.id}
                user={request.receiver}
                type="outgoing"
                requestId={request.id}
                onActionComplete={fetchConnectionData}
              />
            ))
          ) : (
            <p>No outgoing requests.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ConnectPage;
