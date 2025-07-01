import React from 'react';
import './DashboardHome.css';

function DashBoardHome() {
  return (
    <div className="dashboard-home-container">
      <header className="dashboard-header">
        <h2>Hi Jennifer 👋</h2>
        <p>Welcome back to your wellness journey</p>
      </header>

      <section className="dashboard-section grid-two">
        <div className="card mood-card">
          <div className="card-header">
            <h3>This Week’s Mood</h3>
            <a href="#">View All</a>
          </div>
          <p className="mood-text">😊 Good</p>
          <div className="chart-placeholder">Mood Chart Visualization</div>
        </div>

        <div className="card garden-card">
          <h3>Your Garden</h3>
          <div className="chart-placeholder">🌱 Growing beautifully!</div>
          <p className="growth-days">12 days of growth</p>
        </div>
      </section>

      <section className="dashboard-section habits-section">
        <div className="section-header">
          <h3>Today’s Habits</h3>
          <a href="#">Manage Habits</a>
        </div>
        <div className="habits-list">
          <div className="habit">💧 Drink Water <span className="progress">5/8</span></div>
          <div className="habit">🚶 Daily Walk <input type="checkbox" defaultChecked /></div>
          <div className="habit">🧘‍♀️ Meditate <input type="checkbox" /></div>
        </div>
      </section>

      <section className="dashboard-section quick-actions">
        <div className="action-tile">📝 Add Journal Entry</div>
        <div className="action-tile">📊 Log Mood</div>
        <div className="action-tile">✅ Track Habits</div>
      </section>

      <section className="dashboard-section recent-entries">
        <div className="section-header">
          <h3>Recent Journal Entries</h3>
          <a href="#">View All</a>
        </div>
        <div className="entry">
          <p className="entry-date">January 15, 2025</p>
          <p className="entry-snippet">Today was a good day. I managed to complete my morning routine and felt more energized throughout...</p>
          <span className="emoji">😊</span>
        </div>
        <div className="entry">
          <p className="entry-date">January 14, 2025</p>
          <p className="entry-snippet">Feeling neutral today. Work was busy but I made sure to take breaks and practice mindfulness...</p>
          <span className="emoji">😌</span>
        </div>
        <div className="entry">
          <p className="entry-date">January 13, 2025</p>
          <p className="entry-snippet">Great day! Had a wonderful conversation with a friend and completed my meditation session...</p>
          <span className="emoji">😁</span>
        </div>
      </section>
    </div>
  );
}

export default DashBoardHome;
