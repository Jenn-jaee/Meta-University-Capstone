// client/src/components/PlantGrid.jsx
import React from 'react';
import './PlantGrid.css';

const plantStages = [
  '/plantStages/plantstage-0.svg',
  '/plantStages/plantstage-1.svg',
  '/plantStages/plantstage-2.svg',
  '/plantStages/plantstage-3.svg',
  '/plantStages/plantstage-4.svg',
  '/plantStages/plantstage-5.svg',
];

// NOTE: stage = 1 means the first visible plant stage
const PlantGrid = ({ stage = 1 }) => {
  // Clamp to valid index (0 to 5)
  const clampedStage = Math.min(Math.max(stage, 1), 6);
  const plantImage = plantStages[clampedStage - 1];

  return (
    <div className="plant-grid">
      <img
        src={plantImage}
        alt={`Plant stage ${clampedStage}`}
        className="plant-image"
      />
    </div>
  );
};

export default PlantGrid;
