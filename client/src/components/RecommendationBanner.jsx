import './RecommendationBanner.css';

function RecommendationBanner({ title, description, onClose }) {
  if (!title || !description) return null;

  return (
    <div className="recommendation-banner">
      <div className="banner-content">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}

export default RecommendationBanner;
