import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.js';
import Home from './pages/Home.js';
import MovieDetails from './pages/MovieDetails.js';
import Favorites from './pages/Favorites.js';
import Compare from './pages/Compare.js';
import Profile from './pages/Profile.js';
import Login from './pages/Login.js';
import { FavoritesProvider } from './context/FavoritesContext.js';

export default function App() {
  return (
    <FavoritesProvider>
      <Router>
        <div className="app-shell">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </Router>
    </FavoritesProvider>
  );
}
