import './Layout.css';
import { NavLink } from 'react-router-dom';

function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header-container">
        <NavLink to="/dashboard" className="header-title-link">
          <h1 className="header-title">Bloom</h1>
        </NavLink>
        <nav className="header-nav">
          <NavLink
            to="/dashboard"
            className="nav-button"
          >
            🏠 Home
          </NavLink>

          <NavLink
            to="journal"
            className={({ isActive }) =>
              isActive ? 'nav-button active' : 'nav-button'
            }
          >
            Journal
          </NavLink>
          <NavLink
            to="habit"
            className={({ isActive }) =>
              isActive ? 'nav-button active' : 'nav-button'
            }
          >
            Habits
          </NavLink>
          <NavLink
            to="mood"
            className={({ isActive }) =>
              isActive ? 'nav-button active' : 'nav-button'
            }
          >
            Mood
          </NavLink>

          <NavLink
            to="settings"
            className={({ isActive }) =>
              isActive ? 'nav-button active settings-link' : 'nav-button settings-link'
            }
            title="Settings"
          >
            ⚙️ Settings
          </NavLink>

          <NavLink
            to="connect"
            className={({ isActive }) =>
              isActive ? 'nav-button active' : 'nav-button'
            }
          >
            👥 Connections
          </NavLink>


          <NavLink
            to="feed"
            className={({ isActive }) =>
              isActive ? 'nav-button active' : 'nav-button'
            }
          >
            Feed
          </NavLink>


          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
