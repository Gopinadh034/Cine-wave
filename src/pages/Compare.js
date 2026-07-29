import React, { useContext, useState, useEffect, useCallback } from 'react';
import { Trash2, Search, Star, Award, Film, X, Trophy } from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import Loader from '../components/Loader.js';
import './Compare.css';

const API_KEY = '4b22528f';

export default function Compare() {
  const { compareList, removeFromCompare, clearCompare, addToCompare } = useContext(FavoritesContext);
  const [detailedMovies, setDetailedMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  // Search slots state
  const [searchSlot, setSearchSlot] = useState(null); // null or 0/1 index
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchCompareDetails = useCallback(async () => {
    if (compareList.length === 0) {
      setDetailedMovies([]);
      return;
    }
    setLoading(true);
    try {
      const promises = compareList.map((m) =>
        fetch(`https://www.omdbapi.com/?i=${m.imdbID}&plot=short&apikey=${API_KEY}`).then((res) => res.json())
      );
      const data = await Promise.all(promises);
      setDetailedMovies(data.filter((d) => d.Response === 'True'));
    } catch (err) {
      console.error('Failed to fetch details for comparison', err);
    } finally {
      setLoading(false);
    }
  }, [compareList]);

  useEffect(() => {
    fetchCompareDetails();
  }, [fetchCompareDetails]);

  const handleSearchChange = async (val) => {
    setQuery(val);
    if (val.trim().length < 3) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(val)}&apikey=${API_KEY}`);
      const data = await res.json();
      if (data.Response === 'True') {
        setResults(data.Search.slice(0, 5));
      } else {
        setResults([]);
      }
    } catch (err) {
      setResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectMovieForSlot = (movie) => {
    addToCompare(movie);
    setSearchSlot(null);
    setQuery('');
    setResults([]);
  };

  // Compare statistics parsing
  const getRatingValue = (movie, source) => {
    if (!movie || !movie.Ratings) return 0;
    const ratingObj = movie.Ratings.find((r) => r.Source === source);
    if (!ratingObj) return 0;
    if (source === 'Internet Movie Database') return parseFloat(ratingObj.Value.split('/')[0]);
    if (source === 'Rotten Tomatoes') return parseInt(ratingObj.Value);
    if (source === 'Metacritic') return parseInt(ratingObj.Value.split('/')[0]);
    return 0;
  };

  const getBoxOfficeNumber = (movie) => {
    if (!movie || !movie.BoxOffice || movie.BoxOffice === 'N/A') return 0;
    return parseInt(movie.BoxOffice.replace(/[^0-9]/g, ''), 10);
  };

  const getWinner = (field) => {
    if (detailedMovies.length < 2) return null;
    const [m1, m2] = detailedMovies;

    if (field === 'imdb') {
      const r1 = getRatingValue(m1, 'Internet Movie Database');
      const r2 = getRatingValue(m2, 'Internet Movie Database');
      if (r1 > r2) return 0;
      if (r2 > r1) return 1;
    }
    if (field === 'rotten') {
      const r1 = getRatingValue(m1, 'Rotten Tomatoes');
      const r2 = getRatingValue(m2, 'Rotten Tomatoes');
      if (r1 > r2) return 0;
      if (r2 > r1) return 1;
    }
    if (field === 'meta') {
      const r1 = getRatingValue(m1, 'Metacritic');
      const r2 = getRatingValue(m2, 'Metacritic');
      if (r1 > r2) return 0;
      if (r2 > r1) return 1;
    }
    if (field === 'boxoffice') {
      const b1 = getBoxOfficeNumber(m1);
      const b2 = getBoxOfficeNumber(m2);
      if (b1 > b2) return 0;
      if (b2 > b1) return 1;
    }
    return null;
  };

  return (
    <div className="compare-page page-container animate-fade">
      <header className="page-header">
        <h1 className="page-title">
          Movie <span className="grad-text-secondary">Comparison</span>
        </h1>
        <p className="page-subtitle">
          Compare plot, ratings, directors, and box office details side-by-side.
        </p>
      </header>

      {/* Slots Section */}
      <div className="compare-slots-wrapper">
        <div className="slots-grid">
          {[0, 1].map((index) => {
            const movie = detailedMovies[index];
            const hasMovie = !!movie;

            return (
              <div
                key={index}
                className={`compare-slot glass-panel ${!hasMovie ? 'empty-slot' : ''} ${
                  hasMovie && getWinner('imdb') === index ? 'slot-winner' : ''
                }`}
              >
                {hasMovie ? (
                  <div className="slot-movie-content">
                    <button
                      className="remove-slot-btn"
                      onClick={() => removeFromCompare(movie.imdbID)}
                      title="Remove Movie"
                    >
                      <X className="remove-icon" />
                    </button>
                    {getWinner('imdb') === index && (
                      <div className="winner-badge grad-badge">
                        <Trophy className="trophy-icon animate-float" /> Top Rated
                      </div>
                    )}
                    <img
                      src={
                        movie.Poster && movie.Poster !== 'N/A'
                          ? movie.Poster
                          : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400'
                      }
                      alt={movie.Title}
                      className="slot-poster"
                    />
                    <div className="slot-title-info">
                      <h3>{movie.Title}</h3>
                      <span>{movie.Year} • {movie.Runtime}</span>
                    </div>
                  </div>
                ) : (
                  <div className="slot-placeholder">
                    <Film className="placeholder-film-icon" />
                    <button className="glass-button" onClick={() => setSearchSlot(index)}>
                      <Search className="btn-icon" /> Add Movie
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Clear All button */}
        {detailedMovies.length > 0 && (
          <button className="glass-button secondary clear-all-btn" onClick={clearCompare}>
            <Trash2 className="btn-icon" /> Reset Comparison
          </button>
        )}
      </div>

      {/* Direct Add search modal / panel */}
      {searchSlot !== null && (
        <div className="search-overlay animate-fade">
          <div className="search-modal glass-panel animate-scale">
            <div className="modal-header">
              <h3>Search Movie for Slot {searchSlot + 1}</h3>
              <button className="close-modal-btn" onClick={() => setSearchSlot(null)}>
                <X />
              </button>
            </div>
            <div className="modal-search-wrapper">
              <Search className="modal-search-icon" />
              <input
                type="text"
                placeholder="Type movie name..."
                className="glass-input modal-search-input"
                value={query}
                onChange={(e) => handleSearchChange(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-results">
              {searchLoading ? (
                <div className="modal-spinner-wrapper"><Loader /></div>
              ) : results.length === 0 ? (
                <p className="modal-notice">{query.length >= 3 ? 'No movies found.' : 'Enter at least 3 characters to search...'}</p>
              ) : (
                results.map((res) => (
                  <div
                    key={res.imdbID}
                    className="modal-result-item"
                    onClick={() => selectMovieForSlot(res)}
                  >
                    <img
                      src={
                        res.Poster !== 'N/A'
                          ? res.Poster
                          : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=100'
                      }
                      alt={res.Title}
                      className="modal-result-img"
                    />
                    <div className="modal-result-info">
                      <span className="modal-result-title">{res.Title}</span>
                      <span className="modal-result-year">{res.Year}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Comparison Grid Results */}
      {loading ? (
        <Loader />
      ) : (
        detailedMovies.length === 2 && (
          <div className="comparison-details glass-panel animate-slide">
            <table className="compare-table">
              <thead>
                <tr>
                  <th className="table-heading-attribute">Feature</th>
                  <th>{detailedMovies[0].Title}</th>
                  <th>{detailedMovies[1].Title}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="compare-attr">IMDb Rating</td>
                  <td className={getWinner('imdb') === 0 ? 'highlight-cell' : ''}>
                    <div className="rating-cell">
                      <Star className="table-star" fill="#ff9f43" color="#ff9f43" />
                      <span>{detailedMovies[0].imdbRating} / 10</span>
                    </div>
                  </td>
                  <td className={getWinner('imdb') === 1 ? 'highlight-cell' : ''}>
                    <div className="rating-cell">
                      <Star className="table-star" fill="#ff9f43" color="#ff9f43" />
                      <span>{detailedMovies[1].imdbRating} / 10</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="compare-attr">Rotten Tomatoes</td>
                  <td className={getWinner('rotten') === 0 ? 'highlight-cell' : ''}>
                    {detailedMovies[0].Ratings.find((r) => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'}
                  </td>
                  <td className={getWinner('rotten') === 1 ? 'highlight-cell' : ''}>
                    {detailedMovies[1].Ratings.find((r) => r.Source === 'Rotten Tomatoes')?.Value || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="compare-attr">Metascore</td>
                  <td className={getWinner('meta') === 0 ? 'highlight-cell' : ''}>
                    {detailedMovies[0].Metascore !== 'N/A' ? `${detailedMovies[0].Metascore}/100` : 'N/A'}
                  </td>
                  <td className={getWinner('meta') === 1 ? 'highlight-cell' : ''}>
                    {detailedMovies[1].Metascore !== 'N/A' ? `${detailedMovies[1].Metascore}/100` : 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="compare-attr">Box Office</td>
                  <td className={getWinner('boxoffice') === 0 ? 'highlight-cell' : ''}>
                    {detailedMovies[0].BoxOffice || 'N/A'}
                  </td>
                  <td className={getWinner('boxoffice') === 1 ? 'highlight-cell' : ''}>
                    {detailedMovies[1].BoxOffice || 'N/A'}
                  </td>
                </tr>
                <tr>
                  <td className="compare-attr">Director</td>
                  <td>{detailedMovies[0].Director}</td>
                  <td>{detailedMovies[1].Director}</td>
                </tr>
                <tr>
                  <td className="compare-attr">Genre</td>
                  <td>{detailedMovies[0].Genre}</td>
                  <td>{detailedMovies[1].Genre}</td>
                </tr>
                <tr>
                  <td className="compare-attr">Cast</td>
                  <td>{detailedMovies[0].Actors}</td>
                  <td>{detailedMovies[1].Actors}</td>
                </tr>
                <tr>
                  <td className="compare-attr">Awards</td>
                  <td>
                    <div className="awards-cell">
                      <Award className="table-award" />
                      <span>{detailedMovies[0].Awards}</span>
                    </div>
                  </td>
                  <td>
                    <div className="awards-cell">
                      <Award className="table-award" />
                      <span>{detailedMovies[1].Awards}</span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="compare-attr">Plot Synopsis</td>
                  <td className="plot-cell">{detailedMovies[0].Plot}</td>
                  <td className="plot-cell">{detailedMovies[1].Plot}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
