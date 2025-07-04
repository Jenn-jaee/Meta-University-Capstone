// src/components/WelcomeModal.jsx
import React, { useState } from 'react';
import './WelcomeModal.css';

function WelcomeModal({ onSave }) {
const [name, setName] = useState('');

const handleSubmit = () => {
if (!name.trim()) return;
onSave(name.trim());
};

return (
<div className="welcome-modal-overlay">
<div className="welcome-modal-content">
<h2>Hi there, I’m Bloom 🌷</h2>
<p>What should I call you?</p>
<input
type="text"
placeholder="Enter your name (e.g., Jen)"
value={name}
onChange={(e) => setName(e.target.value)}
/>
<button onClick={handleSubmit}>Continue</button>
</div>
</div>
);
}

export default WelcomeModal;
