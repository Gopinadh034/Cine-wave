import React, { createContext, useState, useEffect } from 'react';

export const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('cineWave_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const [compareList, setCompareList] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('cineWave_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const loginUser = (username) => {
    const userData = { username };
    setCurrentUser(userData);
    localStorage.setItem('cineWave_current_user', JSON.stringify(userData));
  };

  const logoutUser = () => {
    setCurrentUser(null);
    localStorage.removeItem('cineWave_current_user');
  };

  useEffect(() => {
    localStorage.setItem('cineWave_favorites', JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (movie) => {
    if (!favorites.some((fav) => fav.imdbID === movie.imdbID)) {
      setFavorites([...favorites, movie]);
    }
  };

  const removeFavorite = (imdbID) => {
    setFavorites(favorites.filter((fav) => fav.imdbID !== imdbID));
  };

  const isFavorite = (imdbID) => {
    return favorites.some((fav) => fav.imdbID === imdbID);
  };

  const addToCompare = (movie) => {
    if (compareList.some((c) => c.imdbID === movie.imdbID)) return;
    if (compareList.length >= 2) {
      // Replace the second one or show notice. Let's just limit to 2 for side-by-side.
      setCompareList([compareList[0], movie]);
    } else {
      setCompareList([...compareList, movie]);
    }
  };

  const removeFromCompare = (imdbID) => {
    setCompareList(compareList.filter((c) => c.imdbID !== imdbID));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        currentUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};
