import './Layout.css';

function Header({ onLogout }) {
  return (
    <header className="header">
      <div className="header-container">
        <h1 className="header-title">MindBloom Journal</h1>
        <nav className="header-nav">
          <button className="nav-button active">Journal</button>
          <button className="nav-button">Habits</button>
          <button className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
