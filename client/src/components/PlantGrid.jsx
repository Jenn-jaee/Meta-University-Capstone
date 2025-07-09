import React from 'react';
import './PlantGrid.css';

const plantStages = [
  '/plantStages/plantstage-0.svg',
  '/plantStages/plantstage-1.svg',
  '/plantStages/plantstage-2.svg',
  '/plantStages/plantstage-3.svg',
  '/plantStages/plantstage-4.svg',
  '/plantStages/plantstage-5.svg'
]
const PlantGrid = ({ stage = 1 }) => {
  const clampedStage = Math.min(stage, 6);
  const plantImage = plantStages[clampedStage - 1];

  return (
    <div className="plant-grid">
      <img src={plantImage} alt={`Plant stage ${clampedStage}`} className="plant-image" />
    </div>
  );
};

export default PlantGrid;
