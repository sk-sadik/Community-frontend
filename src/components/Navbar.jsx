import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get initials for profile bubble
  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-dot"></span>
          <span style={{fontSize:'35px',fontWeight:'bold'}}>Community Service Hub</span>
        </Link>

        {isAuthenticated ? (
          <div className="navbar-menu">
            <Link to="/" className="nav-link">Dashboard</Link>
            {user && user.role !== 'admin' && (
              <Link to="/report" className="nav-link">Report Issue</Link>
            )}
            {user && user.role === 'admin' && (
              <Link to="/admin" className="nav-link admin-glow">Admin Panel</Link>
            )}
            
            <div className="nav-user-section">
              <div className="user-profile-bubble" title={user?.email}>
                {getInitials(user?.name)}
              </div>
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout" title="Log Out">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </button>
            </div>
          </div>
        ) : (
          <div className="navbar-auth-links">
            <Link to="/login" className="btn btn-secondary">Sign In</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
