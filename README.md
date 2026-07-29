# CineWave | Premium Movie Discovery Hub 🎬

CineWave is a modern, high-end React-only movie discovery portfolio project. It integrates the **OMDb REST API** to deliver real-time data on movies, TV shows, and anime. Designed with a premium **dark mode aesthetic, custom gradients, and smooth CSS animations**, it serves as an excellent portfolio piece.

## 🚀 Key Features

* **Multi-Page Routing**: Powered by `react-router-dom` (using `HashRouter` for zero-configuration GitHub Pages deployments).
* **Flat File Structure**: Strictly utilizes flat `.js` and `.css` files rather than nesting components inside extra subfolders. No `.jsx` files.
* **Instant Type-Ahead Suggestions**: Real-time autocomplete dropdown suggestions pop up as you type in the search bar.
* **Category Filtering**: Filter results dynamically by All, Movies, TV Shows, or Episodes.
* **Side-by-Side Comparison Engine**: Compare two movies side-by-side on details like IMDb ratings, Metascores, Rotten Tomatoes, Box Office earnings, cast lists, and awards. Highlights the "winner" with a gold trophy and neon-yellow outline.
* **Global Watchlist / Favorites State**: Persisted local watchlist using `localStorage` and React Context.
* **Interactive Reviews Simulator**: Write and persist ratings and written reviews for any movie.
* **Recommendation Algorithm**: Instantly suggests related movies based on the genre of the active movie.
* **Responsive Fluid Design**: Fully responsive across mobile, tablet, and ultra-wide monitor screens.

---

## 🛠️ Tech Stack & Architecture

* **Frontend**: React 18, React Context
* **Routing**: React Router DOM v6
* **Icons**: Lucide React
* **Styling**: Native CSS3 Variables, Glassmorphism, CSS Custom Keyframe Animations
* **API**: OMDb API (verified active key: `4b22528f`)

---

## 📂 Project Structure

```text
movie-search-app/
├── public/
│   └── index.html           # Main HTML Shell (Google Fonts & favicon)
├── src/
│   ├── components/
│   │   ├── Loader.js        # Glowing loading spinner
│   │   ├── Loader.css
│   │   ├── MovieCard.js     # Responsive listing card with quick action triggers
│   │   ├── MovieCard.css
│   │   ├── MovieGrid.js     # Flex-grid container
│   │   ├── MovieGrid.css
│   │   ├── Navbar.js        # Glassmorphic top navigation with badges
│   │   └── Navbar.css
│   ├── context/
│   │   └── FavoritesContext.js # Watchlist & comparison state provider
│   ├── pages/
│   │   ├── Compare.js       # Comparison grids and slot search modal
│   │   ├── Compare.css
│   │   ├── Favorites.js     # Watchlist page
│   │   ├── Favorites.css
│   │   ├── Home.js          # Explore tab with autocomplete searches
│   │   ├── Home.css
│   │   ├── MovieDetails.js  # Details overview, progress bars & reviews
│   │   ├── MovieDetails.css
│   │   ├── Profile.js       # Developer bio page & contact form
│   │   └── Profile.css
│   ├── App.js               # Route shell mapping
│   ├── index.js             # Root rendering mounting script
│   └── index.css            # Global theme variables, gradients & keyframes
├── package.json             # NPM project script configs
└── README.md                # Documentation guide
```

---

## ⚙️ How to Run Locally

Follow these quick commands to spin up the development server on your system:

### 1. Install Dependencies
Run this in the project root directory:
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```
This runs the app in development mode using `react-scripts`. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### 3. Build for Production
To bundle the app into a static folder (`build/`) ready for hosting:
```bash
npm run build
```
