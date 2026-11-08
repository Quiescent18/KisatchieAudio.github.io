// ============================================================================
//  HIERARCHICAL FILTERING SYSTEM (CREDITS + GENRES)
// ============================================================================

// Unified filter state
const state = {
  credit: {
    broad: null,
    sub: null,
  },
  genre: {
    broad: null,
    sub: null,
  }
};

// DOM references
const trackListEl = document.getElementById("track-list");
const filterButtonsEl = document.getElementById("filter-buttons");
const subCreditButtonsEl = document.getElementById("sub-credit-buttons");

const genreButtonsEl = document.getElementById("genre-buttons");
const subGenreButtonsEl = document.getElementById("sub-genre-buttons");

const clearWrapper = document.getElementById("clear-filters-wrapper");
const player = document.getElementById("player");

let currentPlayingEl = null;
let currentPlayingFile = null;
let filteredTracks = [];


// ============================================================================
//  TRACK MATCHING
// ============================================================================
function trackMatches(track, state) {
  const { credit, genre } = state;

  const broadCreditMatch =
    !credit.broad || track.creditsBroad.includes(credit.broad);

  const subCreditMatch =
    !credit.sub || track.credits.includes(credit.sub);

  const broadGenreMatch =
    !genre.broad || track.genresBroad.includes(genre.broad);

  const subGenreMatch =
    !genre.sub || track.genres.includes(genre.sub);
  
  

  return broadCreditMatch && subCreditMatch && broadGenreMatch && subGenreMatch && isLive(track);
}

function getFilteredTracks() {
  return tracks.filter(track => trackMatches(track, state));
}


// ============================================================================
//  CATEGORY RENDERING (UNIFIED FOR CREDITS + GENRES)
// ============================================================================

function renderCategory(type) {
  const isCredit = type === "credit";
  const hierarchyRoot = isCredit ? heirarchy.creditsBroad : heirarchy.genresBroad;

  const broadContainer = isCredit ? filterButtonsEl : genreButtonsEl;
  const subContainer = isCredit ? subCreditButtonsEl : subGenreButtonsEl;

  const otherType = isCredit ? "genre" : "credit";

  broadContainer.innerHTML = "";
  subContainer.innerHTML = "";

  // --- Render broad buttons ---
  Object.keys(hierarchyRoot).forEach(broad => {

    // Hide if this broad category gives no possible matches
    const hasMatches = tracks.some(track =>
      trackMatches(track, {
        ...state,
        [type]: { broad, sub: null },
      })
    );
    if (!hasMatches) return;

    const btn = document.createElement("button");
    btn.textContent = broad;
    btn.classList.toggle("active", state[type].broad === broad);

    btn.onclick = () => {
      state[type].broad = state[type].broad === broad ? null : broad;
      state[type].sub = null;
      if (type === "credit") {
        gtag("event", "filter_tracks_credit", {
          credit: state.credit.broad,
        });
      } else {
        gtag("event", "filter_tracks_genre", {
          genre: state.genre.broad,
        });
      }

      updateURLParams();

      renderCategory(type);
      renderCategory(otherType);
      renderTracks();
      updateClearButton();
    };

    broadContainer.appendChild(btn);
  });

  // No active broad = stop (no sub-buttons rendered)
  const activeBroad = state[type].broad;
  if (!activeBroad) return;

  // --- Render sub buttons ---
  const subs = hierarchyRoot[activeBroad];

  // Only one subitem? Hide subcategory buttons entirely
  if (subs.length <= 1) {
    state[type].sub = null;
    return;
  }

  subs.forEach(sub => {

    const hasMatches = tracks.some(track =>
      trackMatches(track, {
        ...state,
        [type]: { ...state[type], sub },
      })
    );
    if (!hasMatches) return;

    const btn = document.createElement("button");
    btn.textContent = sub;
    btn.classList.toggle("active", state[type].sub === sub);

    btn.onclick = () => {
      state[type].sub = (state[type].sub === sub ? null : sub);
      // --- GTAG TRACKING ---
      if (type === "credit") {
        gtag("event", "filter_tracks_credit_sub", {
          sub_credit: state.credit.sub,
        });
      } else {
        gtag("event", "filter_tracks_genre_sub", {
          sub_genre: state.genre.sub,
        });
      }
      // UPDATE URL
      updateURLParams();
      renderCategory(type);
      renderCategory(otherType);
      renderTracks();
      updateClearButton();
    };

    subContainer.appendChild(btn);
  });
}

function updateURLParams() {
  const params = new URLSearchParams();

  if (state.credit.broad) params.set("credit_broad", state.credit.broad);
  if (state.credit.sub)   params.set("credit_sub", state.credit.sub);

  if (state.genre.broad) params.set("genre_broad", state.genre.broad);
  if (state.genre.sub)   params.set("genre_sub", state.genre.sub);

  const query = params.toString();
  const hash = window.location.hash || "#portfolio";

  window.history.replaceState({}, "", `${window.location.pathname}?${query}${hash}`);
}

function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);

  state.credit.broad = params.get("credit_broad");
  state.credit.sub   = params.get("credit_sub");

  state.genre.broad = params.get("genre_broad");
  state.genre.sub   = params.get("genre_sub");
}


function isLive(track) {
  if (track.ttl) {
    var q = new Date();
    var m = q.getMonth() + 1;
    var y = q.getFullYear();
    var d = q.getDate();
    var today = `${y}-${m}-${d}`; 
    var todayDate = new Date(today);
    var ttlDate = new Date(track.ttl);
    if (todayDate < ttlDate) {
      return false;
    }
  }
  return true;
}


// ============================================================================
//  TRACK RENDERING
// ============================================================================
function renderTracks() {
  trackListEl.innerHTML = "";

  filteredTracks = getFilteredTracks();

  filteredTracks.forEach(track => {
    const div = document.createElement("div");
    div.className = "track";
    div.dataset.file = track.file;   // <--- desktop version of the fix
    if (!isLive(track)) {
      return; // Skip rendering if not live yet
    }
       
    

    track.ttl

    div.innerHTML = `
      <!-- Desktop carousel card -->
      <div class="track-desktop">
        <img src="${track.artwork}" alt="${track.title}" width="640" height="640" loading="lazy" decoding="async">
        <div class="track-details">
          <div class="track-title">${track.title}</div>
          <div class="track-credits">${track.credits.join(", ")}</div>
          <div class="track-genres"><strong>Genres:</strong> ${track.genres.join(", ")}</div>
          ${track.disclaimer ? `<div class="track-disclaimer">${track.disclaimer}</div>` : ""}
        </div>
      </div>
    `;
    

    div.onclick = () => {
      const same = player.src.includes(track.file);

      if (same) {
        player.paused ? player.play() : player.pause();
      } else {
        playSpecificTrack(track);
      }

      if (currentPlayingEl) currentPlayingEl.classList.remove("playing");
      div.classList.add("playing");
      currentPlayingEl = div;
    };

    if (track.file === currentPlayingFile) {
      div.classList.add("playing");
      currentPlayingEl = div;
    }

    trackListEl.appendChild(div);
  });

  // MOBILE PLAYLIST VERSION
  const mobileList = document.getElementById("mobile-track-list");
  mobileList.innerHTML = "";

  filteredTracks.forEach(track => {
    const row = document.createElement("div");
    row.className = "mobile-track-row";
    row.dataset.file = track.file;   // <--- important

    row.innerHTML = `
      <img class="mobile-track-art" src="${track.artwork}" alt="${track.title}" loading="lazy" decoding="async">
      <div class="mobile-track-text">
        <div class="mobile-track-title">${track.title}</div>
        <div class="mobile-track-artist">${track.credits.join(", ")}</div>
        ${track.disclaimer ? `<div class="mobile-track-disclaimer">${track.disclaimer}</div>` : ""}
      </div>
      <div class="mobile-track-indicator"><i class="fas fa-play"></i></div>
    `;

    row.onclick = () => {
      const same = player.src.includes(track.file);

      if (same) {
        // Pause if playing, play if paused
        player.paused ? player.play() : player.pause();
      } else {
        // New track
        playSpecificTrack(track);
      }

      // Update visual highlighting
      document.querySelectorAll(".mobile-track-row")
        .forEach(r => r.classList.remove("playing"));

      row.classList.add("playing");
    };
    if (track.file === currentPlayingFile) {
      row.classList.add("playing");
    }

    mobileList.appendChild(row);
  });

  updateClearButton();
}


// ============================================================================
//  CLEAR FILTERS
// ============================================================================
function updateClearButton() {
  const anyActive =
    state.credit.broad ||
    state.credit.sub ||
    state.genre.broad ||
    state.genre.sub;

  clearWrapper.style.display = anyActive ? "block" : "none";
}

document.getElementById("clear-filters").onclick = () => {
  state.credit.broad = null;
  state.credit.sub = null;
  state.genre.broad = null;
  state.genre.sub = null;

  updateURLParams();


  renderCategory("credit");
  renderCategory("genre");
  renderTracks();
  updateClearButton();
};


// ============================================================================
//  AUDIO PLAYER + TRACK NAVIGATION
// ============================================================================
player.addEventListener("play", () => {
  const cards = document.querySelectorAll(".track");
  //cards.forEach(card => card.classList.remove("playing"));



  // DESKTOP: apply correct highlight
  const desktopMatch = [...document.querySelectorAll(".track")]
    .find(card => card.dataset.file === currentPlayingFile);

  if (desktopMatch) desktopMatch.classList.add("playing");
});

player.addEventListener("ended", () => {
  if (!filteredTracks || filteredTracks.length === 0) return;

  const index = filteredTracks.findIndex(t => t.file === currentPlayingFile);
  const nextIndex = (index + 1) % filteredTracks.length;

  playSpecificTrack(filteredTracks[nextIndex]);
});

function playSpecificTrack(track) {
  player.src = track.file;
  player.play();
  currentPlayingFile = track.file;


  gtag("event", "play_track", {
        track_title: track.title,
        artist: track.artist,
        credits: track.credits.join(", "),
        genres: track.genres.join(", ")
  });

  const card = [...document.querySelectorAll(".track")]
    .find(c => c.dataset.file === track.file);

  if (card) {
    card.classList.add("playing");
    currentPlayingEl = card;
  }
  // Update mobile playing highlight
  document.querySelectorAll(".mobile-track-row")
    .forEach(r => r.classList.remove("playing"));

  const active = [...document.querySelectorAll(".mobile-track-row")]
    .find(r => r.innerHTML.includes(track.title));

  if (active) active.classList.add("playing");

  // Update mobile highlight
  document.querySelectorAll(".mobile-track-row")
    .forEach(r => r.classList.remove("playing"));

  const activeMobile = [...document.querySelectorAll(".mobile-track-row")]
    .find(r => r.dataset.file === track.file);

  if (activeMobile) activeMobile.classList.add("playing");
}

player.addEventListener("play", () => {
  // DESKTOP highlight
  document.querySelectorAll(".track").forEach(card =>
    card.classList.remove("playing")
  );

  const desktopMatch = [...document.querySelectorAll(".track")]
    .find(card => card.innerHTML.includes(currentPlayingFile));

  renderTracks();

  if (desktopMatch) desktopMatch.classList.add("playing");

  // MOBILE highlight
  document.querySelectorAll(".mobile-track-row")
    .forEach(row => row.classList.remove("playing"));

  const mobileMatch = [...document.querySelectorAll(".mobile-track-row")]
    .find(row => row.dataset.file === currentPlayingFile);

  if (mobileMatch) mobileMatch.classList.add("playing");
});


// ============================================================================
//  DRAG SCROLL
// ============================================================================
function enableDragScroll(containerId) {
  const container = document.getElementById(containerId);
  let isDown = false;
  let startX;
  let scrollLeft;

  container.addEventListener('mousedown', e => {
    isDown = true;
    startX = e.pageX;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener('mouseleave', () => isDown = false);
  container.addEventListener('mouseup', () => isDown = false);

  container.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });
}
enableDragScroll("track-list");

function scrollTracks(direction) {
  const container = document.getElementById("track-list");
  const amount = container.clientWidth * 0.8; // nice smooth scroll
  container.scrollBy({
    left: direction * amount,
    behavior: "smooth"
  });
}

// ============================================================================
//  GALLERY (unchanged)
// ============================================================================
/*function renderGallery() {
  const container = document.getElementById("gallery-container");
  container.innerHTML = "";

  galleryImages.forEach((img, index) => {
    const div = document.createElement("div");
    div.className = "carousel-item";
    div.onclick = () => openLightbox(index);
    div.innerHTML = `<img src="${img.src}" alt="${img.caption}"><p>${img.caption}</p>`;
    container.appendChild(div);
  });
}*/

function openLightbox(index) {
  const item = galleryImages[index];
  document.getElementById("lightbox-img").src = item.src;
  document.getElementById("lightbox-caption").textContent = item.caption;
  document.getElementById("lightbox").style.display = "flex";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
}


// ============================================================================
//  UTILITY + INITIALIZATION
// ============================================================================
function roundToNearest5(num) {
  return Math.floor(num / 5) * 5;
}

function updateInstrumentYears() {
  const y = new Date().getFullYear();
  document.getElementById('years-keys').textContent = `${roundToNearest5(y - 1998)} years`;
  document.getElementById('years-sax').textContent = `${roundToNearest5(y - 2007)} years`;
}
updateInstrumentYears();

//renderGallery();

// ============================================================================
//  REVIEWS WIDGET (loaded only when the visitor scrolls near it — it is heavy)
// ============================================================================
(function () {
  const section = document.getElementById("reviews");
  if (!section) return;

  const loadWidget = () => {
    const s = document.createElement("script");
    s.src = "https://apps.elfsight.com/p/platform.js";
    s.defer = true;
    document.head.appendChild(s);
  };

  if (!("IntersectionObserver" in window)) return loadWidget();

  const observer = new IntersectionObserver(entries => {
    if (!entries.some(e => e.isIntersecting)) return;
    observer.disconnect();
    loadWidget();
  }, { rootMargin: "800px" });
  observer.observe(section);
})();

window.addEventListener("load", () => {
  if (window.location.hash) {
    document.querySelector(window.location.hash)?.scrollIntoView({ behavior: "smooth" });
  }
});


// =============================================
// ROBUST FIX FOR INSTAGRAM/FACEBOOK BROKEN HASHES
// =============================================
(function () {
  const originalURL = window.location.href;
  let extractedHash = null;

  // 1. If URL contains an encoded hash anywhere (failsafe)
  const encodedHashMatch = originalURL.match(/%23([A-Za-z0-9\-_]+)/);
  if (encodedHashMatch) {
    extractedHash = "#" + encodedHashMatch[1];
  }

  // 2. If the browser has a real hash, use it instead
  if (window.location.hash && window.location.hash !== "") {
    extractedHash = window.location.hash;
  }

  // Parse URL for cleanup
  const url = new URL(window.location.href);
  const params = url.searchParams;

  // 3. Remove tracking parameters
  ["fbclid", "brid", "gclid", "utm_source", "utm_medium", "utm_campaign"]
    .forEach(p => params.delete(p));

  // 4. Rebuild cleaned URL
  let cleanURL = window.location.pathname;
  const remaining = params.toString();
  if (remaining) cleanURL += "?" + remaining;

  // IMPORTANT: re-apply hash if we extracted one
  if (extractedHash) cleanURL += extractedHash;

  // 5. Replace URL without reloading
  window.history.replaceState({}, "", cleanURL);

  // 6. Scroll after page loads
  if (extractedHash) {
    window.addEventListener("load", () => {
      const target = document.querySelector(extractedHash);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    });
  }
})();

// INITIAL RENDER
loadFiltersFromURL();
renderCategory("credit");
renderCategory("genre");
renderTracks();
updateClearButton();
