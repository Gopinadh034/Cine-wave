import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Film, Heart, BarChart2, User, Menu, X } from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import './Navbar.css';

export default function Navbar() {
  const { favorites, compareList, currentUser, logoutUser } = useContext(FavoritesContext);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          <Film className="logo-icon" />
          <span className="logo-text grad-text">CineWave</span>
        </Link>

        {/* Desktop Menu */}
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Explore
          </Link>
          <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
            <Heart className="nav-icon" />
            Watchlist
            {favorites.length > 0 && <span className="nav-badge grad-text-accent">{favorites.length}</span>}
          </Link>
          <Link to="/compare" className={`nav-link ${isActive('/compare') ? 'active' : ''}`}>
            <BarChart2 className="nav-icon" />
            Compare
            {compareList.length > 0 && <span className="nav-badge grad-text-secondary">{compareList.length}</span>}
          </Link>
          {currentUser ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                <User className="nav-icon" />
                Profile
              </Link>
              <button onClick={logoutUser} className="nav-link logout-nav-btn">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''} signin-nav-btn grad-badge`}>
              <User className="nav-icon" />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button className="mobile-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="mobile-menu glass-panel animate-scale">
          <Link to="/" className={`mobile-link ${isActive('/') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Explore
          </Link>
          <Link to="/favorites" className={`mobile-link ${isActive('/favorites') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Watchlist ({favorites.length})
          </Link>
          <Link to="/compare" className={`mobile-link ${isActive('/compare') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
            Compare ({compareList.length})
          </Link>
          {currentUser ? (
            <>
              <Link to="/profile" className={`mobile-link ${isActive('/profile') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
                Profile
              </Link>
              <button 
                onClick={() => {
                  logoutUser();
                  setIsOpen(false);
                }} 
                className="mobile-link mobile-logout-btn"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className={`mobile-link ${isActive('/login') ? 'active' : ''}`} onClick={() => setIsOpen(false)}>
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
