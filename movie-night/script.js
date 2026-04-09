// =============================================
//  MOVIE NIGHT — script.js
// =============================================

// ── Data ──────────────────────────────────────
let movies = [];

const SAVE_KEY = "movienight_v1";

// ── Storage ───────────────────────────────────  dhgdhgdsgds   
function saveMovies() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(movies));
}

function loadMovies() {
  // BUG #2: key save & get issues?
  const stored = localStorage.getItem("movie_night");
  if (stored) {
    movies = JSON.parse(stored);
  }
}

// ── Genre Helpers ─────────────────────────────
const genreEmoji = {
  action:    "💥",
  comedy:    "😂",
  drama:     "🎭",
  horror:    "👻",
  "sci-fi":  "🚀",
  thriller:  "🔪",
  animation: "✏️",
  other:     "🎬",
};

function getEmoji(genre) {
  return genreEmoji[genre] || "🎬";
}

// ── Stats ─────────────────────────────────────
function updateStats() {
  const total     = movies.length;
  const watched   = movies.filter(m => m.watched).length;
  const unwatched = total - watched;

  document.getElementById("total-count").textContent    = total;
  document.getElementById("watched-count").textContent  = watched;
  document.getElementById("unwatched-count").textContent = unwatched;
}

// ── Render Stars ──────────────────────────────
function renderStars(movieId, currentRating) {
  const container = document.createElement("div");
  container.className = "star-rating";

  // BUG #3: loop issues!!!
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement("span");
    star.className = "star" + (i <= currentRating + 1 ? " filled" : "");  // BUG: +1 causes extra filled star
    star.textContent = "★";
    star.dataset.value = i;
    star.addEventListener("click", () => {
      const movie = movies.find(m => m.id === movieId);
      if (movie) {
        movie.rating = i;
        saveMovies();
        renderMovies(
          document.getElementById("filter-status").value,
          document.getElementById("filter-genre").value
        );
      }
    });
    container.appendChild(star);
  }

  return container;
}

// ── Render Movies ─────────────────────────────
function renderMovies(statusFilter = "all", genreFilter = "all") {
  const grid = document.getElementById("movie-grid");
  grid.innerHTML = "";

  let visible = [...movies];

  // Genre filter
  if (genreFilter !== "all") {
    visible = visible.filter(m => m.genre === genreFilter);
  }

  // Status filter
  // BUG #4: movie.watched has issues here...
  if (statusFilter === "watched") {
    visible = visible.filter(m => m.watched === "true");    // BUG: should be === true
  } else if (statusFilter === "unwatched") {
    visible = visible.filter(m => m.watched === "false");   // BUG: should be === false
  }

  if (visible.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <span class="big-icon">🍿</span>
        No movies here yet. Add some!
      </div>
    `;
    return;
  }

  visible.forEach(movie => {
    const card = document.createElement("div");
    card.className = "movie-card" + (movie.watched ? " watched" : "");

    card.innerHTML = `
      <div class="movie-poster">
        <span>${getEmoji(movie.genre)}</span>
        <span class="movie-genre-tag">${movie.genre}</span>
      </div>
      <div class="movie-body">
        <div class="movie-title">${movie.title}</div>
        ${movie.year ? `<div class="movie-year">${movie.year}</div>` : ""}
        <div class="star-rating-placeholder"></div>
        ${movie.note ? `<p class="movie-note">${movie.note}</p>` : ""}
      </div>
      <div class="movie-footer">
        <button class="watch-btn ${movie.watched ? "active" : ""}" data-id="${movie.id}">
          ${movie.watched ? "✅ Watched" : "Mark Watched"}
        </button>
        <button class="delete-btn" data-id="${movie.id}" title="Remove">🗑️</button>
      </div>
    `;

    const placeholder = card.querySelector(".star-rating-placeholder");
    placeholder.replaceWith(renderStars(movie.id, movie.rating));

    grid.appendChild(card);
  });

  // Watch toggle
  grid.querySelectorAll(".watch-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const movie = movies.find(m => m.id === btn.dataset.id);
      if (movie) {
        movie.watched = !movie.watched;
        saveMovies();
        updateStats();
        renderMovies(
          document.getElementById("filter-status").value,
          document.getElementById("filter-genre").value
        );
      }
    });
  });

  // Delete
  grid.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      movies = movies.filter(m => m.id !== btn.dataset.id);
      saveMovies();
      updateStats();
      renderMovies(
        document.getElementById("filter-status").value,
        document.getElementById("filter-genre").value
      );
    });
  });
}

// ── Form Submit ───────────────────────────────
// BUG #1: This submit button doesn't work!!!???
document.getElementById("add-movie-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const title = document.getElementById("movie-title").value.trim();
  const genre = document.getElementById("movie-genre").value;
  const year  = document.getElementById("movie-year").value;
  const note  = document.getElementById("movie-note").value.trim();

  if (!title) return;

  movies.unshift({
    id:      String(Date.now()),
    title,
    genre,
    year:    year ? parseInt(year) : null,
    note,
    rating:  0,
    watched: false,
  });

  saveMovies();
  updateStats();
  renderMovies(
    document.getElementById("filter-status").value,
    document.getElementById("filter-genre").value
  );

  document.getElementById("movie-title").value = "";
  document.getElementById("movie-year").value  = "";
  document.getElementById("movie-note").value  = "";
});

// ── Filters ───────────────────────────────────
function handleFilterChange() {
  renderMovies(
    document.getElementById("filter-status").value,
    document.getElementById("filter-genre").value
  );
}

document.getElementById("filter-status").addEventListener("change", handleFilterChange);
document.getElementById("filter-genre").addEventListener("change", handleFilterChange);

// ── Init ──────────────────────────────────────
loadMovies();
updateStats();
renderMovies();

// ★ <-- Jojo reference