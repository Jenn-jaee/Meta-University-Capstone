import React from 'react';
import './WelcomePage.css';
import { useNavigate } from 'react-router-dom';

function WelcomePage() {
 const navigate = useNavigate();

 return (
 <div className="welcome-container">
 <header className="welcome-header">
 <div className="nav-buttons">
 <button className="nav-btn" onClick={() => navigate('/signin')}>Sign In</button>
 <button className="nav-btn" onClick={() => navigate('/signup')}>Sign Up</button>
 </div>
 <h1 className="welcome-title">🌸 Welcome to Bloom</h1>
 <p className="welcome-subtitle">Your wellness garden, blooming one habit at a time 🌱</p>
 </header>

 <section className="features-section">
 <div className="feature-card">
 <span className="feature-icon">📓</span>
 <h3 className="feature-title">Reflect with Journals</h3>
 <p className="feature-text">Capture your thoughts and feelings in daily reflections.</p>
 </div>
 <div className="feature-card">
 <span className="feature-icon">😊</span>
 <h3 className="feature-title">Track Your Mood</h3>
 <p className="feature-text">See how your emotions evolve and grow through time.</p>
 </div>
 <div className="feature-card">
 <span className="feature-icon">🏆</span>
 <h3 className="feature-title">Build Habits</h3>
 <p className="feature-text">Stay consistent with healthy habits using daily logs.</p>
 </div>
 </section>

 <section className="user-stories">
 <h2 className="stories-title"> What Our Users Say</h2>
 <div className="story">
 <p className="quote">“Bloom helped me find peace in my daily routine.”</p>
 <span className="user">— Maya, 21</span>
 </div>
 <div className="story">
 <p className="quote">“The mood tracker is such a game changer! 🌈”</p> <span className="user">— Jordan, 19</span>
 </div>
 </section>

 <footer className="welcome-footer">
 <button className="get-started-btn" onClick={() => navigate('/signin')}> 🌼Get Started</button> </footer>
 </div>
 );
}

export default WelcomePage;
