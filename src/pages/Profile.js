import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Code, Mail, Send, CheckCircle, Github, Linkedin, Globe,
  Film, Camera, Star, Zap, Heart, Award, Edit2, Check, X, Trash2,
  BookOpen, BarChart2 
} from 'lucide-react';
import { FavoritesContext } from '../context/FavoritesContext.js';
import './Profile.css';

const avatarPresets = {
  'avatar-popcorn': { icon: Film, gradient: 'var(--grad-primary)', label: 'Cinephile' },
  'avatar-director': { icon: Camera, gradient: 'var(--grad-secondary)', label: 'Director' },
  'avatar-critic': { icon: Star, gradient: 'var(--grad-accent)', label: 'Critic' },
  'avatar-superhero': { icon: Zap, gradient: 'var(--grad-emerald)', label: 'Action Hero' },
  'avatar-viewer': { icon: User, gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Spectator' },
  'avatar-romance': { icon: Heart, gradient: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)', label: 'Dreamer' },
};

const movieGenresList = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Sci-Fi', 
  'Horror', 'Romance', 'Thriller', 'Fantasy', 'Mystery',
  'Animation', 'Documentary', 'Biography', 'Crime'
];

export default function Profile() {
  const navigate = useNavigate();
  // Tab control: 'user' or 'developer'
  const [activeTab, setActiveTab] = useState('user');

  // Developer contact form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // User Profile state
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('cineWave_user_profile');
    return saved ? JSON.parse(saved) : {
      username: 'Movie Explorer',
      bio: 'Avid cinema enthusiast, playlist builder, and reviews critic.',
      favGenre: 'Sci-Fi',
      favMovie: 'Inception',
      avatar: 'avatar-popcorn'
    };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  // Watchlist statistics state
  const { favorites, currentUser } = useContext(FavoritesContext);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [detailedFavorites, setDetailedFavorites] = useState([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Fetch detailed info for watchlist items in the background
  useEffect(() => {
    const fetchFavoriteDetails = async () => {
      if (favorites.length === 0) {
        setDetailedFavorites([]);
        return;
      }
      setLoadingStats(true);
      try {
        const promises = favorites.map((m) =>
          fetch(`https://www.omdbapi.com/?i=${m.imdbID}&plot=short&apikey=4b22528f`).then((res) => res.json())
        );
        const results = await Promise.all(promises);
        setDetailedFavorites(results.filter((r) => r.Response === 'True'));
      } catch (err) {
        console.error('Error fetching watchlist details for stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchFavoriteDetails();
  }, [favorites]);

  // Load user reviews across all movies
  const loadAllUserReviews = useCallback(async () => {
    setLoadingReviews(true);
    const reviewsFound = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('cineWave_reviews_')) {
        const imdbID = key.replace('cineWave_reviews_', '');
        try {
          const list = JSON.parse(localStorage.getItem(key)) || [];
          list.forEach((rev) => {
            reviewsFound.push({
              ...rev,
              imdbID
            });
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    // Resolve details if missing (for older reviews)
    const updatedReviews = [...reviewsFound];
    for (let i = 0; i < updatedReviews.length; i++) {
      const rev = updatedReviews[i];
      if (!rev.movieTitle || !rev.moviePoster) {
        const favoritedMovie = detailedFavorites.find((m) => m.imdbID === rev.imdbID);
        if (favoritedMovie) {
          rev.movieTitle = favoritedMovie.Title;
          rev.moviePoster = favoritedMovie.Poster;
        } else {
          try {
            const res = await fetch(`https://www.omdbapi.com/?i=${rev.imdbID}&apikey=4b22528f`);
            const data = await res.json();
            if (data.Response === 'True') {
              rev.movieTitle = data.Title;
              rev.moviePoster = data.Poster;
            }
          } catch (err) {
            console.error(err);
          }
        }
      }
    }

    updatedReviews.sort((a, b) => b.id - a.id);
    setReviews(updatedReviews);
    setLoadingReviews(false);
  }, [detailedFavorites]);

  useEffect(() => {
    loadAllUserReviews();
  }, [loadAllUserReviews]);

  // Handle profile edit submission
  const handleSaveProfile = () => {
    setProfile(tempProfile);
    localStorage.setItem('cineWave_user_profile', JSON.stringify(tempProfile));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  // Handle developer contact form submission
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    
    setSubmitted(true);
    setName('');
    setEmail('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  // Delete a review
  const handleDeleteReview = (imdbID, reviewId) => {
    try {
      const key = `cineWave_reviews_${imdbID}`;
      const savedReviews = JSON.parse(localStorage.getItem(key)) || [];
      const updatedReviews = savedReviews.filter((r) => r.id !== reviewId);
      
      if (updatedReviews.length === 0) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(updatedReviews));
      }
      
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (e) {
      console.error(e);
    }
  };

  // Calculations for stats
  // 1. Total Watch Time
  let totalMinutes = 0;
  detailedFavorites.forEach((movie) => {
    if (movie.Runtime && movie.Runtime !== 'N/A') {
      const mins = parseInt(movie.Runtime.replace(/[^0-9]/g, ''), 10);
      if (!isNaN(mins)) totalMinutes += mins;
    }
  });
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const watchTimeString = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  // 2. Average rating of favorites
  let totalRating = 0;
  let ratingCount = 0;
  detailedFavorites.forEach((movie) => {
    if (movie.imdbRating && movie.imdbRating !== 'N/A') {
      const rating = parseFloat(movie.imdbRating);
      if (!isNaN(rating)) {
        totalRating += rating;
        ratingCount++;
      }
    }
  });
  const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A';

  // 3. Top Genres Count
  const genreCounts = {};
  detailedFavorites.forEach((movie) => {
    if (movie.Genre && movie.Genre !== 'N/A') {
      const genres = movie.Genre.split(',').map((g) => g.trim());
      genres.forEach((genre) => {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      });
    }
  });
  const sortedGenres = Object.entries(genreCounts)
    .map(([genreName, count]) => ({ name: genreName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Get active avatar components
  const activeAvatar = avatarPresets[profile.avatar] || avatarPresets['avatar-popcorn'];
  const AvatarIconComponent = activeAvatar.icon;

  if (!currentUser) return null;

  return (
    <div className="profile-page page-container animate-fade">
      <header className="page-header">
        <h1 className="page-title">
          My <span className="grad-text">CineWave</span> Dashboard
        </h1>
        <p className="page-subtitle">
          Manage your personal movie tracking preferences, stats, and review history.
        </p>

        {/* Tab Selector */}
        <div className="tab-selector-wrapper">
          <div className="tab-selector glass-panel">
            <button 
              className={`tab-btn ${activeTab === 'user' ? 'active' : ''}`}
              onClick={() => setActiveTab('user')}
            >
              <User className="tab-icon" /> Personal Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === 'developer' ? 'active' : ''}`}
              onClick={() => setActiveTab('developer')}
            >
              <Code className="tab-icon" /> About Developer
            </button>
          </div>
        </div>
      </header>

      {activeTab === 'user' ? (
        <div className="profile-layout animate-scale">
          {/* User Profile Card */}
          <section className="profile-card user-card glass-panel">
            <div className="avatar-wrapper">
              <div 
                className="avatar-gradient"
                style={{ background: activeAvatar.gradient }}
              >
                <AvatarIconComponent className="avatar-icon" />
              </div>
              {!isEditing && (
                <button 
                  className="edit-profile-trigger" 
                  onClick={() => {
                    setTempProfile(profile);
                    setIsEditing(true);
                  }}
                  title="Edit Profile"
                >
                  <Edit2 className="edit-trigger-icon" />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="profile-edit-form">
                <div className="edit-field">
                  <label>Username</label>
                  <input 
                    type="text"
                    className="glass-input edit-input"
                    value={tempProfile.username}
                    onChange={(e) => setTempProfile({ ...tempProfile, username: e.target.value })}
                  />
                </div>
                <div className="edit-field">
                  <label>Bio</label>
                  <textarea 
                    className="glass-input edit-input edit-textarea"
                    rows="2"
                    value={tempProfile.bio}
                    onChange={(e) => setTempProfile({ ...tempProfile, bio: e.target.value })}
                  />
                </div>
                <div className="edit-field">
                  <label>Favorite Genre</label>
                  <select 
                    className="glass-input edit-input edit-select"
                    value={tempProfile.favGenre}
                    onChange={(e) => setTempProfile({ ...tempProfile, favGenre: e.target.value })}
                  >
                    {movieGenresList.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="edit-field">
                  <label>Favorite Movie</label>
                  <input 
                    type="text"
                    className="glass-input edit-input"
                    value={tempProfile.favMovie}
                    onChange={(e) => setTempProfile({ ...tempProfile, favMovie: e.target.value })}
                  />
                </div>

                <div className="edit-field">
                  <label>Select Badge</label>
                  <div className="avatar-presets-grid">
                    {Object.entries(avatarPresets).map(([key, value]) => {
                      const PresetIcon = value.icon;
                      return (
                        <button
                          key={key}
                          type="button"
                          className={`avatar-preset-btn ${tempProfile.avatar === key ? 'active' : ''}`}
                          style={{ background: value.gradient }}
                          onClick={() => setTempProfile({ ...tempProfile, avatar: key })}
                          title={value.label}
                        >
                          <PresetIcon className="preset-icon" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="edit-actions">
                  <button className="glass-button save-btn" onClick={handleSaveProfile}>
                    <Check className="btn-icon-small" /> Save
                  </button>
                  <button className="glass-button secondary cancel-btn" onClick={handleCancelEdit}>
                    <X className="btn-icon-small" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-display-info">
                <h2 className="dev-name">{profile.username}</h2>
                <span className="user-badge-label grad-badge" style={{ background: activeAvatar.gradient }}>
                  {activeAvatar.label}
                </span>
                <p className="dev-bio">{profile.bio}</p>

                <div className="user-meta-details glass-panel">
                  <div className="meta-detail-row">
                    <span className="detail-label">Fav Genre:</span>
                    <span className="detail-value text-glow">{profile.favGenre}</span>
                  </div>
                  <div className="meta-detail-row">
                    <span className="detail-label">Fav Movie:</span>
                    <span className="detail-value text-glow">{profile.favMovie}</span>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* User Stats & Reviews Column */}
          <div className="profile-details-column">
            {/* Stats Dashboard */}
            <section className="stats-section glass-panel">
              <h3 className="section-title-small">
                <BarChart2 className="section-icon-small grad-text-secondary" /> CineWave Analytics
              </h3>
              
              {loadingStats ? (
                <div className="stats-loading">Calculating stats...</div>
              ) : (
                <div className="stats-grid">
                  <div className="stat-card glass-panel">
                    <span className="stat-label">Watchlist</span>
                    <span className="stat-num grad-text">{favorites.length}</span>
                    <span className="stat-sub">Saved Titles</span>
                  </div>
                  <div className="stat-card glass-panel">
                    <span className="stat-label">Watch Time</span>
                    <span className="stat-num grad-text-secondary">{favorites.length > 0 ? watchTimeString : '0m'}</span>
                    <span className="stat-sub">Est. Duration</span>
                  </div>
                  <div className="stat-card glass-panel">
                    <span className="stat-label">Avg Rating</span>
                    <span className="stat-num grad-text-accent">{favorites.length > 0 ? `${avgRating}` : '0.0'}</span>
                    <span className="stat-sub">IMDb Score</span>
                  </div>
                  <div className="stat-card glass-panel">
                    <span className="stat-label">Reviews</span>
                    <span className="stat-num grad-text-emerald">{reviews.length}</span>
                    <span className="stat-sub">Total Written</span>
                  </div>
                </div>
              )}
            </section>

            {/* Favorite Genre Bar Chart */}
            {favorites.length > 0 && sortedGenres.length > 0 && (
              <section className="genre-analysis-section glass-panel">
                <h3 className="section-title-small">
                  <Award className="section-icon-small grad-text-accent" /> Watchlist Genre Distribution
                </h3>
                <div className="genre-bars">
                  {sortedGenres.map((g) => {
                    const maxVal = Math.max(...sortedGenres.map(x => x.count));
                    const widthPercent = (g.count / maxVal) * 100;
                    return (
                      <div key={g.name} className="genre-bar-row">
                        <div className="genre-bar-name">{g.name}</div>
                        <div className="genre-bar-container">
                          <div 
                            className="genre-bar-fill grad-primary"
                            style={{ width: `${widthPercent}%` }}
                          ></div>
                          <span className="genre-bar-count">{g.count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* User Review History */}
            <section className="user-reviews-section glass-panel">
              <h3 className="section-title-small">
                <BookOpen className="section-icon-small grad-text-emerald" /> Review History
              </h3>
              
              {loadingReviews ? (
                <div className="reviews-loading">Loading reviews...</div>
              ) : reviews.length === 0 ? (
                <div className="no-reviews-box">
                  <p>You haven't posted any reviews yet.</p>
                  <Link to="/" className="glass-button secondary search-btn-sm">Explore Movies</Link>
                </div>
              ) : (
                <div className="profile-reviews-list">
                  {reviews.map((rev, index) => (
                    <div key={`${rev.imdbID}_${rev.id || index}`} className="profile-review-card glass-panel animate-slide">
                      <div className="review-movie-info">
                        <img 
                          src={rev.moviePoster && rev.moviePoster !== 'N/A' ? rev.moviePoster : 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&q=80&w=100'} 
                          alt={rev.movieTitle}
                          className="review-movie-poster"
                        />
                        <div className="review-movie-details">
                          <Link to={`/movie/${rev.imdbID}`} className="review-movie-title-link">
                            <h4>{rev.movieTitle}</h4>
                          </Link>
                          <div className="review-meta-row">
                            <div className="review-stars-list">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className="star-icon-xs"
                                  fill={i < rev.rating ? '#ff9f43' : 'none'}
                                  color={i < rev.rating ? '#ff9f43' : '#444'}
                                />
                              ))}
                            </div>
                            <span className="review-date-str">{rev.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="profile-review-text">"{rev.text}"</p>
                      
                      <button 
                        className="delete-review-btn" 
                        onClick={() => handleDeleteReview(rev.imdbID, rev.id)}
                        title="Delete Review"
                      >
                        <Trash2 className="delete-btn-icon" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      ) : (
        <div className="profile-layout animate-scale">
          {/* Developer Bio Card */}
          <section className="profile-card glass-panel">
            <div className="avatar-wrapper">
              <div className="avatar-gradient">
                <User className="avatar-icon" />
              </div>
            </div>
            <h2 className="dev-name">Gopi Krishna</h2>
            <p className="dev-title">Full Stack Developer</p>
            <p className="dev-bio">
              Passionate programmer focused on crafting highly interactive, modern web experiences. 
              I specialize in React, Node.js, and creating sleek, custom design systems.
            </p>

            <div className="social-links">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-link" title="GitHub">
                <Github />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-link" title="LinkedIn">
                <Linkedin />
              </a>
              <a href="https://portfolio.com" target="_blank" rel="noopener noreferrer" className="social-link" title="Portfolio">
                <Globe />
              </a>
            </div>
          </section>

          {/* Project details and Contact */}
          <div className="profile-details-column animate-slide">
            {/* Tech Stack details */}
            <section className="tech-section glass-panel">
              <h3 className="section-title-small">
                <Code className="section-icon-small grad-text-secondary" /> Project Architecture
              </h3>
              <p className="project-description">
                CineWave is built using clean, client-side React code with a strict flat-file structure 
                and native CSS variables for styling. Features include:
              </p>
              <div className="tech-tags">
                <span className="tech-tag">React 18</span>
                <span className="tech-tag">React Router v6</span>
                <span className="tech-tag">OMDB Rest API</span>
                <span className="tech-tag">Lucide Icons</span>
                <span className="tech-tag">CSS3 Gradients</span>
                <span className="tech-tag">CSS Transitions</span>
                <span className="tech-tag">LocalStorage API</span>
              </div>
            </section>

            {/* Contact Form */}
            <section className="contact-section glass-panel">
              <h3 className="section-title-small">
                <Mail className="section-icon-small grad-text-accent" /> Get In Touch
              </h3>

              {submitted ? (
                <div className="success-banner animate-scale">
                  <CheckCircle className="success-icon" />
                  <div>
                    <h4>Message Sent Successfully!</h4>
                    <p>Thank you for reaching out. I'll get back to you shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="contact-form">
                  <div className="input-group">
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="glass-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="glass-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <textarea
                    placeholder="Your Message..."
                    className="glass-input contact-textarea"
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                  <button type="submit" className="glass-button submit-contact-btn">
                    <Send className="btn-icon-send" /> Send Message
                  </button>
                </form>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
