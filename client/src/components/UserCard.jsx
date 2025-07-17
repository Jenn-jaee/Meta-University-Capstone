import { useState, useEffect } from 'react';
import './UserCard.css';
import axios from '../api/axiosInstance';
import toast from 'react-hot-toast';

function UserCard({ user, type, requestId, onActionComplete }) {
  const [status, setStatus] = useState(type); // 'suggested' | 'incoming' | 'outgoing' | 'connected'
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Update status if type prop changes
  useEffect(() => {
    setStatus(type);
  }, [type]);

  /**
   * Helper that wraps a request and updates status on success
   * @param {string} method - HTTP method (get, post, delete, etc.)
   * @param {string} url - API endpoint URL
   * @param {string} newStatus - Status to set on successful action
   * @param {string} actionName - Name of the action for error messages
   * @param {string} successMessage - Custom success message for the toast
   */
  const action = (method, url, newStatus, actionName, successMessage) => {
    setIsLoading(true);
    setError(null);

    return axios[method](url)
      .then(() => {
        setStatus(newStatus);
        toast.success(successMessage || `Successfully ${actionName.toLowerCase()}ed`);

        // TODO: When feed feature is implemented, trigger feed update here
        // Example: updateFeed({ type: actionName, userId: user.id });

        if (onActionComplete) onActionComplete();
      })
      .catch((err) => {
        // More specific error messages based on status codes
        if (err.response?.status === 404) {
          setError(`User or request not found. Please refresh and try again.`);
        } else if (err.response?.status === 401) {
          setError(`You need to log in again to continue.`);
        } else {
          setError(`Failed to ${actionName.toLowerCase()}. Please try again.`);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  // --- Button handlers with descriptive action names and custom success messages ---
  const handleSend = () => action('post', `/api/connection-requests/send/${user.id}`, 'outgoing', 'Connect', 'Connection request sent');
  const handleAccept = () => action('post', `/api/connection-requests/accept/${requestId}`, 'connected', 'Accept', 'Connection accepted');
  const handleDecline = () => action('delete', `/api/connection-requests/decline/${requestId}`, 'suggested', 'Decline', 'Request declined');
  const handleCancel = () => action('delete', `/api/connection-requests/cancel/${requestId}`, 'suggested', 'Cancel', 'Request canceled');
  const handleRemoveClick = () => setShowConfirmation(true);
  const handleCancelRemove = () => setShowConfirmation(false);
  const handleConfirmRemove = () => {
    setShowConfirmation(false);
    action('delete', `/api/connections/remove/${user.id}`, 'suggested', 'Remove', 'Connection removed');
  };

  // Clear error when status changes
  useEffect(() => {
    setError(null);
  }, [status]);

  // --- Render a button based on current status ---
  const renderButton = () => {
    switch (status) {
      case 'suggested':
        return <button onClick={handleSend} disabled={isLoading}>{isLoading ? 'Connecting...' : 'Connect'}</button>;
      case 'incoming':
        return (
          <>
            <button onClick={handleAccept} disabled={isLoading}>{isLoading ? 'Accepting...' : 'Accept'}</button>
            <button className="secondary" onClick={handleDecline} disabled={isLoading}>{isLoading ? 'Declining...' : 'Decline'}</button>
          </>
        );
      case 'outgoing':
        return <button onClick={handleCancel} disabled={isLoading}>{isLoading ? 'Canceling...' : 'Cancel'}</button>;
      case 'connected':
        return <button onClick={handleRemoveClick} disabled={isLoading}>{isLoading ? 'Removing...' : 'Remove'}</button>;
      default:
        return null;
    }
  };

  return (
    <div className="user-card">
      <img
        src={user.avatarUrl || '/default-avatar.png'}
        alt={user.displayName}
        className="avatar"
      />
      <p className="name">{user.displayName}</p>

      <div className="actions">
        {renderButton()}
      </div>

      {error && <p className="error-message">{error}</p>}

      {showConfirmation && (
        <div className="confirmation-overlay">
          <div className="confirmation-dialog">
            <p>Are you sure you want to remove this connection?</p>
            <div className="confirmation-actions">
              <button onClick={handleConfirmRemove} className="confirm-button">Yes, Remove</button>
              <button onClick={handleCancelRemove} className="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserCard;
