import React from 'react';
import MovieCard from './MovieCard.js';
import './MovieGrid.css';

export default function MovieGrid({ movies }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="empty-grid animate-fade">
        <p>No movies found. Try searching for something else!</p>
      </div>
    );
  }

  return (
    <div className="movie-grid animate-fade">
      {movies.map((movie) => (
        <MovieCard key={movie.imdbID} movie={movie} />
      ))}
    </div>
  );
}
