// Kisatchie Audio portfolio player and hierarchical filters.
// Requires tracks.js to load before this file. Compatible with the current index.html.

const state = {
  credit: { broad: null, sub: null },
  genre:  { broad: null, sub: null }
};

const trackListEl = document.getElementById('track-list');
const filterButtonsEl = document.getElementById('filter-buttons');
const genreButtonsEl = document.getElementById('genre-buttons');
const clearWrapper = document.getElementById('clear-filters-wrapper');
const player = document.getElementById('player');

// The existing Kisatchie index.html has broad-filter rows, but no sub-filter rows.
// Create only the two missing rows; no HTML edits are required.
function getOrCreateSubFilters(parent, id) {
  let element = document.getElementById(id);
  if (!element && parent) {
    element = document.createElement('div');
    element.id = id;
    element.className = 'filter-buttons';
    parent.insertAdjacentElement('afterend', element);
  }
  return element;
}

const subCreditButtonsEl = getOrCreateSubFilters(filterButtonsEl, 'sub-credit-buttons');
const subGenreButtonsEl = getOrCreateSubFilters(genreButtonsEl, 'sub-genre-buttons');

let currentPlayingFile = null;
let filteredTracks = [];

// Google Analytics is optional. The current Kisatchie index.html does not define gtag.
function recordEvent(name, details) {
  if (typeof gtag === 'function') gtag('event', name, details);
}

function isLive(track) {
  if (!track.ttl) return true;
  const today = new Date();
  const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  return localDate >= track.ttl;
}

function trackMatches(track, filterState = state) {
  return (
    (!filterState.credit.broad || track.creditsBroad.includes(filterState.credit.broad)) &&
    (!filterState.credit.sub   || track.credits.includes(filterState.credit.sub)) &&
    (!filterState.genre.broad  || track.genresBroad.includes(filterState.genre.broad)) &&
    (!filterState.genre.sub    || track.genres.includes(filterState.genre.sub)) &&
    isLive(track)
  );
}

function getFilteredTracks() {
  return tracks.filter(track => trackMatches(track));
}

function renderCategory(type) {
  const isCredit = type === 'credit';
  const hierarchyRoot = isCredit ? heirarchy.creditsBroad : heirarchy.genresBroad;
  const broadContainer = isCredit ? filterButtonsEl : genreButtonsEl;
  const subContainer = isCredit ? subCreditButtonsEl : subGenreButtonsEl;
  if (!broadContainer || !subContainer) return;

  broadContainer.replaceChildren();
  subContainer.replaceChildren();

  Object.keys(hierarchyRoot).forEach(broad => {
    const testState = {
      ...state,
      [type]: { broad, sub: null }
    };
    if (!tracks.some(track => trackMatches(track, testState))) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = broad;
    button.classList.toggle('active', state[type].broad === broad);
    button.onclick = () => {
      state[type].broad = state[type].broad === broad ? null : broad;
      state[type].sub = null;
      recordEvent(isCredit ? 'filter_tracks_credit' : 'filter_tracks_genre', {
        [type]: state[type].broad
      });
      updateURLParams();
      refreshPortfolio();
    };
    broadContainer.appendChild(button);
  });

  const activeBroad = state[type].broad;
  if (!activeBroad || !hierarchyRoot[activeBroad]) return;

  // Suppress the extra row for categories with only one subcategory.
  const allSubs = hierarchyRoot[activeBroad];
  if (allSubs.length <= 1) {
    state[type].sub = null;
    return;
  }

  allSubs.forEach(sub => {
    const testState = {
      ...state,
      [type]: { broad: activeBroad, sub }
    };
    if (!tracks.some(track => trackMatches(track, testState))) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = sub;
    button.classList.toggle('active', state[type].sub === sub);
    button.onclick = () => {
      state[type].sub = state[type].sub === sub ? null : sub;
      recordEvent(isCredit ? 'filter_tracks_credit_sub' : 'filter_tracks_genre_sub', {
        [isCredit ? 'sub_credit' : 'sub_genre']: state[type].sub
      });
      updateURLParams();
      refreshPortfolio();
    };
    subContainer.appendChild(button);
  });
}

function updateURLParams() {
  const url = new URL(window.location.href);
  ['credit_broad', 'credit_sub', 'genre_broad', 'genre_sub'].forEach(key => {
    url.searchParams.delete(key);
  });
  if (state.credit.broad) url.searchParams.set('credit_broad', state.credit.broad);
  if (state.credit.sub) url.searchParams.set('credit_sub', state.credit.sub);
  if (state.genre.broad) url.searchParams.set('genre_broad', state.genre.broad);
  if (state.genre.sub) url.searchParams.set('genre_sub', state.genre.sub);
  if (!url.hash) url.hash = 'portfolio';
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
}

function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  for (const [type, hierarchyRoot] of [
    ['credit', heirarchy.creditsBroad],
    ['genre', heirarchy.genresBroad]
  ]) {
    const broad = params.get(`${type}_broad`);
    const sub = params.get(`${type}_sub`);
    state[type].broad = broad && hierarchyRoot[broad] ? broad : null;
    state[type].sub = state[type].broad && hierarchyRoot[state[type].broad].includes(sub) ? sub : null;
  }
}

function updatePlayingHighlights() {
  document.querySelectorAll('.track, .mobile-track-row').forEach(element => {
    element.classList.toggle('playing', element.dataset.file === currentPlayingFile);
  });
}

function playSpecificTrack(track) {
  if (!track) return;
  currentPlayingFile = track.file;
  player.src = track.file;
  const playback = player.play();
  if (playback && typeof playback.catch === 'function') {
    playback.catch(error => console.warn('Could not play track:', error));
  }
  recordEvent('play_track', {
    track_title: track.title,
    artist: track.artist || track.title.split(' - ')[0],
    credits: track.credits.join(', '),
    genres: track.genres.join(', ')
  });
  updatePlayingHighlights();
}

function toggleTrack(track) {
  if (currentPlayingFile !== track.file) return playSpecificTrack(track);
  if (player.paused) {
    const playback = player.play();
    if (playback && typeof playback.catch === 'function') playback.catch(console.warn);
  } else {
    player.pause();
  }
  updatePlayingHighlights();
}

function renderTracks() {
  if (!trackListEl) return;
  filteredTracks = getFilteredTracks();
  trackListEl.replaceChildren();

  filteredTracks.forEach(track => {
    const div = document.createElement('div');
    div.className = 'track';
    div.dataset.file = track.file;
    div.innerHTML = `
      <div class="track-desktop">
        <img src="${track.artwork}" alt="${track.title}" width="640" height="640" loading="lazy" decoding="async">
        <div class="track-details">
          <div class="track-title">${track.title}</div>
          <div class="track-credits">${track.credits.join(', ')}</div>
          <div class="track-genres"><strong>Genres:</strong> ${track.genres.join(', ')}</div>
          ${track.disclaimer ? `<div class="track-disclaimer">${track.disclaimer}</div>` : ''}
        </div>
      </div>`;
    div.onclick = () => toggleTrack(track);
    trackListEl.appendChild(div);
  });

  // Optional: support a mobile playlist on pages that include one.
  const mobileList = document.getElementById('mobile-track-list');
  if (mobileList) {
    mobileList.replaceChildren();
    filteredTracks.forEach(track => {
      const row = document.createElement('div');
      row.className = 'mobile-track-row';
      row.dataset.file = track.file;
      row.innerHTML = `
        <img class="mobile-track-art" src="${track.artwork}" alt="${track.title}" loading="lazy" decoding="async">
        <div class="mobile-track-text">
          <div class="mobile-track-title">${track.title}</div>
          <div class="mobile-track-artist">${track.credits.join(', ')}</div>
          ${track.disclaimer ? `<div class="mobile-track-disclaimer">${track.disclaimer}</div>` : ''}
        </div>
        <div class="mobile-track-indicator"><i class="fas fa-play"></i></div>`;
      row.onclick = () => toggleTrack(track);
      mobileList.appendChild(row);
    });
  }
  updatePlayingHighlights();
  updateClearButton();
}

function updateClearButton() {
  if (!clearWrapper) return;
  const anyActive = state.credit.broad || state.credit.sub || state.genre.broad || state.genre.sub;
  clearWrapper.style.display = anyActive ? 'block' : 'none';
}

function refreshPortfolio() {
  renderCategory('credit');
  renderCategory('genre');
  renderTracks();
}

const clearButton = document.getElementById('clear-filters');
if (clearButton) {
  clearButton.onclick = () => {
    for (const type of ['credit', 'genre']) {
      state[type].broad = null;
      state[type].sub = null;
    }
    updateURLParams();
    refreshPortfolio();
  };
}

if (player) {
  player.addEventListener('play', updatePlayingHighlights);
  player.addEventListener('ended', () => {
    if (!filteredTracks.length) return;
    const currentIndex = filteredTracks.findIndex(track => track.file === currentPlayingFile);
    const nextTrack = filteredTracks[(currentIndex + 1) % filteredTracks.length];
    playSpecificTrack(nextTrack);
  });
}

function enableDragScroll(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  let isDown = false;
  let startX = 0;
  let initialScrollLeft = 0;
  container.addEventListener('mousedown', event => {
    isDown = true;
    startX = event.pageX;
    initialScrollLeft = container.scrollLeft;
  });
  container.addEventListener('mouseleave', () => { isDown = false; });
  container.addEventListener('mouseup', () => { isDown = false; });
  container.addEventListener('mousemove', event => {
    if (!isDown) return;
    event.preventDefault();
    container.scrollLeft = initialScrollLeft - (event.pageX - startX) * 1.5;
  });
}

function scrollTracks(direction) {
  if (!trackListEl) return;
  trackListEl.scrollBy({ left: direction * trackListEl.clientWidth * 0.8, behavior: 'smooth' });
}

enableDragScroll('track-list');

function openLightbox(index) {
  if (typeof galleryImages === 'undefined' || !galleryImages[index]) return;
  const image = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const lightbox = document.getElementById('lightbox');
  if (image) image.src = galleryImages[index].src;
  if (caption) caption.textContent = galleryImages[index].caption;
  if (lightbox) lightbox.style.display = 'flex';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) lightbox.style.display = 'none';
}

// Load reviews only when they are close to the viewport.
(function () {
  const section = document.getElementById('reviews');
  if (!section) return;
  const loadWidget = () => {
    const script = document.createElement('script');
    script.src = 'https://apps.elfsight.com/p/platform.js';
    script.defer = true;
    document.head.appendChild(script);
  };
  if (!('IntersectionObserver' in window)) return loadWidget();
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    loadWidget();
  }, { rootMargin: '800px' });
  observer.observe(section);
})();

// Clean up ad tracking params and restore hashes encoded by social-app browsers.
(function () {
  const url = new URL(window.location.href);
  const encodedHash = url.href.match(/%23([A-Za-z0-9_-]+)/);
  ['fbclid', 'brid', 'gclid', 'utm_source', 'utm_medium', 'utm_campaign']
    .forEach(param => url.searchParams.delete(param));
  if (!url.hash && encodedHash) url.hash = encodedHash[1];
  window.history.replaceState({}, '', url.pathname + url.search + url.hash);
})();

window.addEventListener('load', () => {
  const hash = window.location.hash;
  if (!hash) return;
  try {
    document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth' });
  } catch (error) { /* Ignore invalid hashes from third-party links. */ }
});

loadFiltersFromURL();
refreshPortfolio();
