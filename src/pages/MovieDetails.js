import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, BarChart2, Star, Award, Users, Calendar, Clock, ArrowLeft, Send } from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import Loader from '../components/Loader.js';
import MovieCard from '../components/MovieCard.js';
import './MovieDetails.css';

const API_KEY = '4b22528f';

export default function MovieDetails() {
  const { id } = useParams();
  const { isFavorite, addFavorite, removeFavorite, compareList, addToCompare, removeFromCompare } =
    useContext(FavoritesContext);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  
  // Interactive reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  const isFav = movie && isFavorite(movie.imdbID);
  const isCompared = movie && compareList.some((c) => c.imdbID === movie.imdbID);

  const fetchRecommendations = useCallback(async (genre) => {
    try {
      const res = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(genre)}&apikey=${API_KEY}`);
      const data = await res.json();
      if (data.Response === 'True') {
        // Filter out current movie and show top 4 recommendations
        const filtered = data.Search.filter((item) => item.imdbID !== id).slice(0, 4);
        setRecommendations(filtered);
      }
    } catch (err) {
      console.error(err);
    }
  }, [id]);

  const fetchMovieDetails = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Get detailed movie info
      const res = await fetch(`https://www.omdbapi.com/?i=${id}&plot=full&apikey=${API_KEY}`);
      const data = await res.json();
      if (data.Response === 'True') {
        setMovie(data);
        // Fetch recommendations using the first genre category
        const firstGenre = data.Genre ? data.Genre.split(',')[0].trim() : 'Action';
        fetchRecommendations(firstGenre);
      } else {
        setError(data.Error || 'Could not fetch movie details.');
      }
    } catch (err) {
      setError('An error occurred while loading details.');
    } finally {
      setLoading(false);
    }
  }, [id, fetchRecommendations]);

  const loadReviews = useCallback(() => {
    const savedReviews = localStorage.getItem(`cineWave_reviews_${id}`);
    if (savedReviews) {
      setReviews(JSON.parse(savedReviews));
    } else {
      // Fallback default mock reviews for portfolio content
      const mockReviews = [
        {
          id: 1,
          author: 'Alex Mercer',
          rating: 5,
          text: 'An absolute masterpiece of cinema! The visual direction, styling, and background scores are gorgeous. Highly recommended.',
          date: 'July 24, 2026',
        },
        {
          id: 2,
          author: 'Sophia Vance',
          rating: 4,
          text: 'Great storytelling and cinematography. The second half dragged slightly, but the climax and performances made it completely worth it.',
          date: 'July 27, 2026',
        },
      ];
      setReviews(mockReviews);
      localStorage.setItem(`cineWave_reviews_${id}`, JSON.stringify(mockReviews));
    }
  }, [id]);

  useEffect(() => {
    fetchMovieDetails();
    loadReviews();
  }, [fetchMovieDetails, loadReviews]);

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewText.trim()) return;

    const newReview = {
      id: Date.now(),
      author: reviewAuthor,
      rating: Number(reviewRating),
      text: reviewText,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      movieTitle: movie.Title,
      moviePoster: movie.Poster,
    };

    const updatedReviews = [newReview, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`cineWave_reviews_${id}`, JSON.stringify(updatedReviews));

    // Clear form inputs
    setReviewAuthor('');
    setReviewText('');
    setReviewRating(5);
  };

  const handleFavoriteToggle = () => {
    if (isFav) {
      removeFavorite(movie.imdbID);
    } else {
      addFavorite(movie);
    }
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeFromCompare(movie.imdbID);
    } else {
      addToCompare(movie);
    }
  };

  if (loading) return <div className="page-container"><Loader /></div>;
  if (error) {
    return (
      <div className="page-container error-details animate-fade">
        <Link to="/" className="back-link"><ArrowLeft /> Back to Search</Link>
        <div className="error-message glass-panel"><p>{error}</p></div>
      </div>
    );
  }

  const posterUrl =
    movie.Poster && movie.Poster !== 'N/A'
      ? movie.Poster
      : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="details-page page-container animate-fade">
      {/* Blurred Backdrop */}
      <div className="details-backdrop" style={{ backgroundImage: `url(${posterUrl})` }}></div>

      <Link to="/" className="back-link">
        <ArrowLeft className="back-icon" /> Back to Explore
      </Link>

      <div className="details-layout">
        {/* Poster & Actions */}
        <div className="details-sidebar animate-scale">
          <div className="poster-container glass-panel">
            <img src={posterUrl} alt={movie.Title} className="details-poster" />
            {movie.Type && <span className="details-badge grad-badge">{movie.Type.toUpperCase()}</span>}
          </div>

          <div className="details-actions">
            <button
              className={`glass-button action-btn-full fav-btn-full ${isFav ? 'active' : ''}`}
              onClick={handleFavoriteToggle}
            >
              <Heart fill={isFav ? '#fff' : 'none'} className="btn-icon" />
              {isFav ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
            <button
              className={`glass-button secondary action-btn-full compare-btn-full ${isCompared ? 'active' : ''}`}
              onClick={handleCompareToggle}
            >
              <BarChart2 className="btn-icon" />
              {isCompared ? 'Comparing' : 'Compare Movie'}
            </button>
          </div>
        </div>

        {/* Content Details */}
        <div className="details-main animate-slide">
          <div className="main-header">
            <h1 className="details-title">{movie.Title}</h1>
            <div className="quick-stats">
              <span className="stat-pill"><Calendar className="stat-icon" /> {movie.Released}</span>
              <span className="stat-pill"><Clock className="stat-icon" /> {movie.Runtime}</span>
              <span className="stat-pill age-rating">{movie.Rated}</span>
            </div>
            <div className="genre-tags">
              {movie.Genre &&
                movie.Genre.split(',').map((g) => (
                  <span key={g} className="genre-tag">
                    {g.trim()}
                  </span>
                ))}
            </div>
          </div>

          {/* Ratings Grid */}
          <div className="ratings-grid">
            {movie.Ratings &&
              movie.Ratings.map((rating) => {
                let scorePercentage = 0;
                let colorClass = 'primary';
                
                if (rating.Source === 'Internet Movie Database') {
                  const val = parseFloat(rating.Value.split('/')[0]);
                  scorePercentage = val * 10;
                  colorClass = 'primary';
                } else if (rating.Source === 'Rotten Tomatoes') {
                  scorePercentage = parseInt(rating.Value);
                  colorClass = 'accent';
                } else if (rating.Source === 'Metacritic') {
                  const val = parseInt(rating.Value.split('/')[0]);
                  scorePercentage = val;
                  colorClass = 'secondary';
                }

                return (
                  <div key={rating.Source} className="rating-card glass-panel">
                    <div className="rating-source">{rating.Source}</div>
                    <div className="rating-value">{rating.Value}</div>
                    <div className="rating-bar-outer">
                      <div
                        className={`rating-bar-inner grad-${colorClass}`}
                        style={{ width: `${scorePercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Core Info */}
          <div className="info-section glass-panel">
            <h3 className="section-subtitle">Synopsis</h3>
            <p className="plot-text">{movie.Plot}</p>
          </div>

          <div className="credits-grid">
            <div className="credit-card glass-panel">
              <Users className="credit-icon grad-text" />
              <div>
                <h4>Cast & Crew</h4>
                <p><strong>Director:</strong> {movie.Director}</p>
                <p><strong>Writers:</strong> {movie.Writer}</p>
                <p><strong>Actors:</strong> {movie.Actors}</p>
              </div>
            </div>

            <div className="credit-card glass-panel">
              <Award className="credit-icon grad-text-accent" />
              <div>
                <h4>Awards & Box Office</h4>
                <p><strong>Awards:</strong> {movie.Awards}</p>
                <p><strong>Box Office:</strong> {movie.BoxOffice && movie.BoxOffice !== 'N/A' ? movie.BoxOffice : 'Unknown'}</p>
                <p><strong>Production:</strong> {movie.Production && movie.Production !== 'N/A' ? movie.Production : 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Interactive Reviews Section */}
          <div className="reviews-section glass-panel">
            <h3 className="section-subtitle">User Reviews</h3>

            {/* Review Form */}
            <form onSubmit={handleAddReview} className="review-form">
              <div className="form-row">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="glass-input review-input"
                  value={reviewAuthor}
                  onChange={(e) => setReviewAuthor(e.target.value)}
                  required
                />
                <div className="rating-select-wrapper">
                  <span className="select-label">Rating:</span>
                  <div className="stars-input">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className="star-btn"
                        onClick={() => setReviewRating(star)}
                      >
                        <Star
                          className="star-icon"
                          fill={star <= reviewRating ? '#ff9f43' : 'none'}
                          color={star <= reviewRating ? '#ff9f43' : '#c5c3e0'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <textarea
                  placeholder="Share your thoughts about this movie..."
                  className="glass-input review-textarea"
                  rows="3"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>
              <button type="submit" className="glass-button submit-review-btn">
                <Send className="btn-icon-send" /> Submit Review
              </button>
            </form>

            {/* Reviews List */}
            <div className="reviews-list">
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to add one!</p>
              ) : (
                reviews.map((rev) => (
                  <div key={rev.id} className="review-item animate-fade">
                    <div className="review-header">
                      <span className="review-author">{rev.author}</span>
                      <div className="review-meta-info">
                        <div className="review-stars">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className="star-icon-small"
                              fill={i < rev.rating ? '#ff9f43' : 'none'}
                              color={i < rev.rating ? '#ff9f43' : '#444'}
                            />
                          ))}
                        </div>
                        <span className="review-date">{rev.date}</span>
                      </div>
                    </div>
                    <p className="review-text-content">{rev.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Carousel/Grid */}
      {recommendations.length > 0 && (
        <section className="recommendations-section animate-slide">
          <h2 className="recommendations-title">Recommended For You</h2>
          <div className="recommendations-grid">
            {recommendations.map((rec) => (
              <MovieCard key={rec.imdbID} movie={rec} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
