import React, { useState } from 'react';
import './WelcomePage.css';
import { useNavigate } from 'react-router-dom';
// import SignUpModal from './SignUpModal';

const WelcomePage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="welcome-container">
      {/* Fixed Header */}
      <header className="welcome-header">
        <div className="logo">Bloom</div>
        <nav className="nav-links">
          <button onClick={() => scrollToSection('features')}>Features</button>
          <button onClick={() => scrollToSection('testimonials')}>Testimonials</button>
          <button onClick={() => scrollToSection('support')}>Support</button>
          <button onClick={() => scrollToSection('contact')}>Contact</button>
          <button onClick={() => navigate('/signin')}>Sign In</button>
          <button className="signup-btn" onClick={() => setShowModal(true)}>Sign Up</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
            <div className="hero-art">
                <img src="/bloom.png" alt="Floating flower" className="floating-flower" />
            </div>
            <div className="hero-text center">
                <h1>
                <span className="highlight">Bloom:</span> Your Emotional Wellness Companion
                </h1>
                <p>
                Empowering you with guided journaling, habit tracking, and mood reflection — all in one serene space.
                </p>
                <button className="get-started-btn" onClick={() => navigate('/signin')}>Get Started</button>
            </div>
        </section>


      {/* Features */}
      <section id="features" className="features-section">
        <h2>What We Offer</h2>
        <div className="features-grid">
          <div className="feature-card">
            <img src="/mood.webp" alt="Mood" />
            <h3>Mood Tracking</h3>
            <p>Understand your emotional patterns over time and grow with intention.</p>
          </div>
          <div className="feature-card">
            <img src="/journal.webp" alt="Journaling" />
            <h3>Guided Journaling</h3>
            <p>Reflect daily with beautifully crafted prompts and a calming writing space.</p>
          </div>
          <div className="feature-card">
            <img src="/habit.png" alt="Habits" />
            <h3>Habit Progress</h3>
            <p>Build meaningful habits with visual trackers and gentle encouragement.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section-alt">
        <h2>What Our Users Are Saying</h2>
        <div className="testimonial-cards">
          <div className="testimonial-card">
            <img src="/assets/user1.svg" alt="User" />
            <p>"Bloom helped me feel grounded each morning and reflect with more grace."</p>
            <span>- Amina R.</span>
          </div>
          <div className="testimonial-card">
            <img src="/assets/user2.svg" alt="User" />
            <p>"The mood tracker helped me understand myself better than ever before."</p>
            <span>- Leo M.</span>
          </div>
          <div className="testimonial-card">
            <img src="/assets/user3.svg" alt="User" />
            <p>"Finally, a wellness app that feels safe, beautiful, and useful."</p>
            <span>- Harper L.</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-columns">
          <div className="footer-col">
            <h4>Bloom</h4>
            <p>Nurture your inner self, one journal at a time.</p>
          </div>
          <div className="footer-col" id="support">
            <h4>Support</h4>
            <ul>
              <li>Help Center</li>
              <li>Community</li>
              <li>FAQs</li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <p>Email: support@bloomapp.com</p>
            <p>Phone: (555) 123-4567</p>
            <p>Address: 22 Serenity Lane, Mindful City</p>
          </div>
        </div>
        <p className="footer-bottom">© 2025 Bloom Wellness. All rights reserved.</p>
      </footer>

      {/* Sign-Up Modal */}
      {showModal && <SignUpModal closeModal={() => setShowModal(false)} />}
    </div>
  );
};

export default WelcomePage;
