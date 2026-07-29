import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Heart, BarChart2, Calendar } from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import './MovieCard.css';

export default function MovieCard({ movie }) {
  const { isFavorite, addFavorite, removeFavorite, compareList, addToCompare, removeFromCompare } =
    useContext(FavoritesContext);

  const { Title, Year, imdbID, Type, Poster } = movie;

  const isFav = isFavorite(imdbID);
  const isCompared = compareList.some((c) => c.imdbID === imdbID);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFav) {
      removeFavorite(imdbID);
    } else {
      addFavorite(movie);
    }
  };

  const handleCompareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeFromCompare(imdbID);
    } else {
      addToCompare(movie);
    }
  };

  // Safe poster rendering with placeholder fallback
  const posterUrl =
    Poster && Poster !== 'N/A'
      ? Poster
      : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="movie-card glass-panel animate-scale">
      <Link to={`/movie/${imdbID}`} className="movie-card-link">
        <div className="poster-wrapper">
          <img src={posterUrl} alt={Title} loading="lazy" className="poster-img" />
          <div className="poster-overlay">
            <span className="glass-button secondary view-details-btn">
              View Details
            </span>
          </div>

          {/* Quick Actions */}
          <div className="card-actions">
            <button
              className={`action-btn fav-btn ${isFav ? 'active' : ''}`}
              onClick={handleFavoriteClick}
              title={isFav ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Heart className="action-icon" fill={isFav ? '#e94057' : 'none'} />
            </button>
            <button
              className={`action-btn compare-btn ${isCompared ? 'active' : ''}`}
              onClick={handleCompareClick}
              title={isCompared ? 'Remove from Comparison' : 'Compare Movie'}
            >
              <BarChart2 className="action-icon" />
            </button>
          </div>

          {/* Type Badge */}
          {Type && <span className="type-badge grad-badge">{Type.toUpperCase()}</span>}
        </div>

        <div className="movie-info">
          <h3 className="movie-title" title={Title}>{Title}</h3>
          <div className="movie-meta">
            <span className="movie-year">
              <Calendar className="meta-icon" /> {Year}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
