import './WelcomePage.css';
import User1 from '../assets/User1.png';
import User2 from '../assets/User2.png';
import User3 from '../assets/User3.png';
import { useNavigate } from 'react-router-dom';
import { FaTwitter, FaInstagram, FaLinkedinIn, FaFacebookF } from 'react-icons/fa';
import { FaLocationDot } from 'react-icons/fa6';
import { MdEmail, MdPhone } from 'react-icons/md';

const WelcomePage = () => {
  const navigate = useNavigate();

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
          <button className="signup-btn" onClick={() => navigate('/signin?mode=signup')}>Sign Up</button>
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
                <button className="get-started-btn" onClick={() => navigate('/signin?mode=signup')}>Get Started</button>
            </div>
        </section>


      {/* Features */}
      <section id="features" className="features-section">
        <h2 className="features-heading">What We Offer</h2>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">
              <img src="/mood.webp" alt="Mood Tracking" />
            </div>
            <h3 className="feature-title">Mood Tracking</h3>
            <p className="feature-description">Understand your emotional patterns over time and grow with intention.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/journal.webp" alt="Guided Journaling" />
            </div>
            <h3 className="feature-title">Guided Journaling</h3>
            <p className="feature-description">Reflect daily with beautifully crafted prompts and a calming writing space.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <img src="/habit.png" alt="Habit Progress" />
            </div>
            <h3 className="feature-title">Habit Progress</h3>
            <p className="feature-description">Build meaningful habits with visual trackers and gentle encouragement.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="testimonials-section-alt">
        <h2>What Our Users Are Saying</h2>
        <div className="testimonial-zigzag">
          {/* First testimonial - Left aligned */}
          <div className="testimonial-row left-aligned">
            <div className="testimonial-avatar-container">
              <div className="user-image-container bg-warm-1">
                <img src={User1} alt="Olivia Bennett" className="user-image" />
              </div>
              <div className="user-info">
                <span className="user-name">Olivia Bennett</span>
                <div className="star-rating">★★★★★</div>
              </div>
            </div>
            <div className="testimonial-text">
              <p>"Bloom has been my lifeline during my wellness journey. The AI answers my questions at 3 AM when I'm feeling anxious, and the weekly updates help me understand exactly what's happening with my emotional development."</p>
            </div>
          </div>

          {/* Second testimonial - Right aligned */}
          <div className="testimonial-row right-aligned">
            <div className="testimonial-text">
              <p>"As someone new to mindfulness, I had so many questions and anxieties. Bloom's personalized guidance made me feel supported every step of the way. The wellness tips helped me manage stress and develop healthier daily habits."</p>
            </div>
            <div className="testimonial-avatar-container">
              <div className="user-image-container bg-warm-2">
                <img src={User2} alt="Daniel Carter" className="user-image" />
              </div>
              <div className="user-info">
                <span className="user-name">Daniel Carter</span>
                <div className="star-rating">★★★★★</div>
              </div>
            </div>
          </div>

          {/* Third testimonial - Left aligned */}
          <div className="testimonial-row left-aligned">
            <div className="testimonial-avatar-container">
              <div className="user-image-container bg-warm-3">
                <img src={User3} alt="Maya Thompson" className="user-image" />
              </div>
              <div className="user-info">
                <span className="user-name">Maya Thompson</span>
                <div className="star-rating">★★★★★</div>
              </div>
            </div>
            <div className="testimonial-text">
              <p>"I love how Bloom combines psychological insights with emotional support. It's like having a therapist, coach, and supportive friend all in one app. The weekly tracking visuals are beautiful and make me excited for each new stage of growth."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="footer">
        <div className="footer-main">
          <div className="footer-col branding-col">
            <div className="footer-logo">Bloom</div>
            <p className="footer-tagline">Nurture your emotional wellbeing, one mindful moment at a time.</p>
            <div className="social-icons">
              <a href="#" className="social-icon">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon">
                <FaInstagram />
              </a>
              <a href="#" className="social-icon">
                <FaLinkedinIn />
              </a>
              <a href="#" className="social-icon">
                <FaFacebookF />
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#">About Us</a></li>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Partners</a></li>
            </ul>
          </div>

          <div className="footer-col" id="support">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Help Center</a></li>
              <li><a href="#">FAQs</a></li>
              <li><a href="#">Contact</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-col contact-col">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <span className="contact-icon"><FaLocationDot /></span>
              <p>22 Serenity Lane<br />Mindful City, MC 12345</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon"><MdEmail /></span>
              <p>support@bloomapp.com</p>
            </div>
            <div className="contact-item">
              <span className="contact-icon"><MdPhone /></span>
              <p>(555) 123-4567</p>
            </div>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="copyright">© 2025 Bloom Wellness. All rights reserved.</p>
          <div className="policy-links">
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default WelcomePage;
