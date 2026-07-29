import React, { useState, useEffect, useRef } from 'react';
import { Search, Star } from 'lucide-react';
import MovieGrid from '../components/MovieGrid.js';
import Loader from '../components/Loader.js';
import './Home.css';

const API_KEY = '4b22528f';

export default function Home() {
  const [query, setQuery] = useState('');
  const [type, setType] = useState(''); // 'movie', 'series', 'episode' or ''
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const searchRef = useRef(null);

  // Load default movies on mount (trending/popular list)
  useEffect(() => {
    fetchMovies('Avengers', type);
  }, [type]);

  // Click outside listener for autocomplete suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchMovies = async (searchQuery, filterType) => {
    if (!searchQuery) return;
    setLoading(true);
    setError('');
    try {
      let url = `https://www.omdbapi.com/?s=${encodeURIComponent(searchQuery)}&apikey=${API_KEY}`;
      if (filterType) {
        url += `&type=${filterType}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.Response === 'True') {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setError(data.Error || 'No movies found.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Instant query suggestions logic (debounced autocomplete)
  useEffect(() => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    const delayDebounceFn = setTimeout(async () => {
      try {
        let url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${API_KEY}`;
        if (type) url += `&type=${type}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.Response === 'True') {
          setSuggestions(data.Search.slice(0, 5)); // top 5 suggestions
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, type]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchMovies(query, type);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (title) => {
    setQuery(title);
    fetchMovies(title, type);
    setShowSuggestions(false);
  };

  const handleTypeChange = (newType) => {
    setType(newType);
  };

  return (
    <div className="home-page page-container animate-fade">
      {/* Hero Header Area */}
      <header className="hero-section">
        <div className="hero-glow animate-float"></div>
        <div className="hero-content">
          <div className="badge-wrapper animate-slide">
            <span className="hero-badge grad-badge">
              <Star className="badge-icon" fill="currentColor" /> Welcome to CineWave
            </span>
          </div>
          <h1 className="hero-title animate-slide">
            Discover the <span className="grad-text">Cinematic</span> Universe
          </h1>
          <p className="hero-subtitle animate-slide">
            Search, compare and build your custom watchlist with real-time ratings, actors, awards, and reviews database.
          </p>

          {/* Search Form with suggestions dropdown */}
          <form onSubmit={handleSearchSubmit} className="search-form animate-slide" ref={searchRef}>
            <div className="search-input-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search movies, TV shows, anime..."
                className="glass-input search-input"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
              />
              <button type="submit" className="glass-button search-btn">
                Search
              </button>
            </div>

            {/* Autocomplete Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="suggestions-box glass-panel animate-scale">
                {suggestions.map((item) => (
                  <div
                    key={item.imdbID}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(item.Title)}
                  >
                    <img
                      src={
                        item.Poster !== 'N/A'
                          ? item.Poster
                          : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={item.Title}
                      className="suggestion-img"
                    />
                    <div className="suggestion-info">
                      <span className="suggestion-title">{item.Title}</span>
                      <span className="suggestion-meta">{item.Year} • {item.Type.toUpperCase()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Filter Categories */}
          <div className="category-filters animate-slide">
            <button
              className={`filter-btn ${type === '' ? 'active' : ''}`}
              onClick={() => handleTypeChange('')}
            >
              All
            </button>
            <button
              className={`filter-btn ${type === 'movie' ? 'active' : ''}`}
              onClick={() => handleTypeChange('movie')}
            >
              Movies
            </button>
            <button
              className={`filter-btn ${type === 'series' ? 'active' : ''}`}
              onClick={() => handleTypeChange('series')}
            >
              TV Shows
            </button>
            <button
              className={`filter-btn ${type === 'episode' ? 'active' : ''}`}
              onClick={() => handleTypeChange('episode')}
            >
              Episodes
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="movies-content">
        <h2 className="section-title">
          {query ? `Search Results for "${query}"` : 'Trending Releases'}
          <span className="section-title-line"></span>
        </h2>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="error-message glass-panel">
            <p>{error}</p>
          </div>
        ) : (
          <MovieGrid movies={movies} />
        )}
      </main>
    </div>
  );
}
