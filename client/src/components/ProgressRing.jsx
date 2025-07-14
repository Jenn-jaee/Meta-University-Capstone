import React from 'react';
import './ProgressRing.css';

/**
 * A circular progress ring.
 *
 * @param {number} percentage – value from 0-100
 * @param {number} size       – SVG width / height in px
 * @param {number} stroke     – stroke width in px
 */
const ProgressRing = ({ percentage = 0, size = 100, stroke = 10 }) => {
  const radius       = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset       = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="progress-ring-wrapper">
      {/* background circle */}
      <circle
        className="progress-ring-bg"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeWidth={stroke}
        fill="transparent"
      />

      {/* foreground (animated) circle */}
      <circle
        className="progress-ring-fg"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeWidth={stroke}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />

      {/* text label */}
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="progress-ring-label"
      >
        {Math.round(percentage)}%
      </text>
    </svg>
  );
};

export default ProgressRing;
