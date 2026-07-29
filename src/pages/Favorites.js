import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, ArrowRight } from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import MovieGrid from '../components/MovieGrid.js';
import './Favorites.css';

export default function Favorites() {
  const { favorites } = useContext(FavoritesContext);

  return (
    <div className="favorites-page page-container animate-fade">
      <header className="page-header">
        <h1 className="page-title">
          My <span className="grad-text-accent">Watchlist</span>
        </h1>
        <p className="page-subtitle">
          Keep track of all the movies and series you want to watch or have loved.
        </p>
      </header>

      {favorites.length === 0 ? (
        <div className="empty-favorites-panel glass-panel animate-scale">
          <Heart className="empty-icon animate-float" fill="none" />
          <h2>Your watchlist is currently empty</h2>
          <p>Explore thousands of movies, discover recommendations, and add them here!</p>
          <Link to="/" className="glass-button search-cta">
            <Search className="cta-icon" /> Find Movies <ArrowRight className="cta-arrow" />
          </Link>
        </div>
      ) : (
        <div className="favorites-content">
          <div className="favorites-count">
            Total Movies Saved: <span className="grad-text">{favorites.length}</span>
          </div>
          <MovieGrid movies={favorites} />
        </div>
      )}
    </div>
  );
}
