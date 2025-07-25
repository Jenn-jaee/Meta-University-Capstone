import './RecommendationBanner.css';

function RecommendationBanner({ title, description, onClose, onAction, actionText }) {
  if (!title || !description) return null;

  // Handle banner dismissal
  const handleDismiss = () => {
    // Store the current timestamp when banner is dismissed
    localStorage.setItem('lastBannerDismissTime', Date.now().toString());

    // Store the dismissed banner tag to prevent showing the same banner again too soon
    if (title) {
      localStorage.setItem('lastDismissedBannerTag', title);
    }

    // Call the parent's onClose handler
    if (onClose) onClose();
  };

  return (
    <div className="recommendation-banner">
      <div className="banner-content">
        <strong>{title}</strong>
        <p>{description}</p>

        {/* Action button if provided */}
        {onAction && actionText && (
          <button className="banner-action-btn" onClick={onAction}>
            {actionText}
          </button>
        )}
      </div>
      <button className="close-btn" onClick={handleDismiss}>
        &times;
      </button>
    </div>
  );
}

export default RecommendationBanner;
