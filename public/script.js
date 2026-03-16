document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('hero-section');
  const videoGrid = document.getElementById('video-grid');

  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content" style="max-height: 90vh; overflow-y: auto;">
      <button class="close-modal"><i class="fas fa-times"></i></button>

      <!-- Video Player Area -->
      <div id="player-container" class="hidden" style="width: 100%; aspect-ratio: 16/9; background: #000; position: relative;">
          <video id="videoPlayer" controls style="width: 100%; height: 100%;"></video>
          <div id="playerLoading" class="hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
          <div id="playerError" class="hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: red;">Error playing video.</div>
      </div>

      <!-- Detail Info -->
      <div style="padding: 20px;">
          <h2 id="modalTitle" style="color: white; margin-bottom: 10px;"></h2>
          <div style="display: flex; gap: 15px; margin-bottom: 15px;">
              <img id="modalPoster" src="" style="width: 100px; border-radius: 8px;">
              <div>
                  <p id="modalStatus" style="color: #aaa; margin-bottom: 5px;"></p>
                  <p id="modalChapters" style="color: #aaa; margin-bottom: 10px;"></p>
                  <p id="modalSynopsis" style="color: #ccc; font-size: 0.9em;"></p>
              </div>
          </div>

          <h3 style="color: white; margin-bottom: 15px;">Episodes</h3>
          <div id="episodeGridLoading" class="hidden" style="color: white; text-align: center;"><i class="fas fa-spinner fa-spin"></i> Loading episodes...</div>
          <div id="episodeGrid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(60px, 1fr)); gap: 10px; max-height: 200px; overflow-y: auto;">
          </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModalBtn = modal.querySelector('.close-modal');
  const videoPlayer = document.getElementById('videoPlayer');

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    videoPlayer.pause();
    videoPlayer.src = '';
    document.getElementById('player-container').classList.add('hidden');
  });

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      videoPlayer.pause();
      videoPlayer.src = '';
      document.getElementById('player-container').classList.add('hidden');
    }
  });

  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  async function fetchDramas() {
    try {
      // Use the ferdev API proxy we created in worker.js
      const response = await fetch('/api/drakor?query=CEO', {
        headers: {
            'Accept': 'application/json, text/plain, */*'
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const text = await response.text();

      let data;
      try {
          data = JSON.parse(text);
      } catch (e) {
          console.error("Failed to parse API response");
          throw new Error("Failed to parse API response");
      }

      const items = data.result || data.data;

      if (items && Array.isArray(items) && items.length > 0) {
        renderDramas(items);
      } else {
        showError('Tidak ada drama ditemukan');
      }
    } catch (error) {
      console.error('Error fetching dramas:', error);
      showError('Gagal memuat drama. Silakan coba lagi nanti.');
    }
  }

  function renderDramas(dramas) {
    const heroDrama = dramas[0];
    const gridDramas = dramas.slice(1);
    const listToRender = gridDramas.length > 0 ? gridDramas : dramas;

    renderHero(heroDrama);
    renderGrid(listToRender);
  }

  function renderHero(drama) {
    heroSection.innerHTML = `
      <div class="hero-video-container">
        <img src="${escapeHTML(drama.cover)}" alt="${escapeHTML(drama.title)}">
      </div>
      <div class="hero-content">
        <h1 class="hero-title">${escapeHTML(drama.title)}</h1>
        <div class="hero-meta">
          <span><i class="fas fa-list"></i> ${escapeHTML(drama.total_chapters || '?')} Episode</span>
          <span><i class="fas fa-info-circle"></i> ${escapeHTML(drama.status || 'Ongoing')}</span>
        </div>
        <p class="hero-desc">${escapeHTML(drama.sinopsis || 'Tidak ada sinopsis.')}</p>
        <div class="hero-actions">
          <button class="info-btn" data-id="${escapeHTML(drama.book_id)}">
            <i class="fas fa-info-circle"></i> Detail & Episode
          </button>
        </div>
      </div>
    `;

    const infoBtn = heroSection.querySelector('.info-btn');
    infoBtn.addEventListener('click', () => {
      openDetail(drama);
    });
  }

  function renderGrid(dramas) {
    videoGrid.innerHTML = '';

    dramas.forEach(drama => {
      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <img class="video-thumbnail" src="${escapeHTML(drama.cover)}" alt="${escapeHTML(drama.title)}">
        <div class="play-icon-overlay">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="video-info">
          <h3 class="video-title" title="${escapeHTML(drama.title)}">${escapeHTML(drama.title)}</h3>
          <div class="video-stats">
            <i class="fas fa-list"></i> ${escapeHTML(drama.total_chapters || 'N/A')} Eps
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        openDetail(drama);
      });

      videoGrid.appendChild(card);
    });
  }

  async function openDetail(item) {
      document.getElementById('modalTitle').innerText = item.title;
      document.getElementById('modalPoster').src = item.cover;
      document.getElementById('modalSynopsis').innerText = item.sinopsis || 'Tidak ada sinopsis.';
      document.getElementById('modalStatus').innerText = item.status || 'Ongoing';
      document.getElementById('modalChapters').innerText = `${item.total_chapters || 0} Episodes`;

      document.getElementById('player-container').classList.add('hidden');
      videoPlayer.pause();
      videoPlayer.src = '';

      document.getElementById('episodeGrid').innerHTML = '';
      document.getElementById('episodeGridLoading').classList.remove('hidden');
      modal.classList.add('active');

      try {
          const response = await fetch(`/api/detail?bookId=${item.book_id}`);
          const data = await response.json();

          let chapters = [];
          if (data.success && data.result) {
              if (Array.isArray(data.result)) chapters = data.result;
              else if (data.result.episodes && Array.isArray(data.result.episodes)) chapters = data.result.episodes;
          }

          document.getElementById('episodeGridLoading').classList.add('hidden');

          if (chapters.length > 0) {
              renderEpisodeGrid(chapters);
          } else {
              document.getElementById('episodeGrid').innerHTML = '<p style="color: #aaa;">Tidak ada episode.</p>';
          }
      } catch (error) {
          document.getElementById('episodeGridLoading').classList.add('hidden');
          document.getElementById('episodeGrid').innerHTML = '<p style="color: red;">Gagal memuat episode.</p>';
      }
  }

  function renderEpisodeGrid(chapters) {
      const grid = document.getElementById('episodeGrid');
      grid.innerHTML = '';

      chapters.forEach(chapter => {
          const btn = document.createElement('button');
          btn.innerText = chapter.chapter_num || chapter.episode_number || '?';
          btn.style.padding = '8px';
          btn.style.background = '#333';
          btn.style.color = 'white';
          btn.style.border = 'none';
          btn.style.borderRadius = '4px';
          btn.style.cursor = 'pointer';

          btn.onmouseover = () => btn.style.background = '#e50914';
          btn.onmouseout = () => btn.style.background = '#333';

          btn.onclick = () => playEpisode(chapter);
          grid.appendChild(btn);
      });
  }

  async function playEpisode(chapter) {
      const container = document.getElementById('player-container');
      const loading = document.getElementById('playerLoading');
      const error = document.getElementById('playerError');

      container.classList.remove('hidden');
      videoPlayer.pause();
      videoPlayer.src = '';

      loading.classList.remove('hidden');
      error.classList.add('hidden');

      if(chapter.cover) {
           videoPlayer.poster = chapter.cover;
      }

      try {
          const response = await fetch(`/api/stream?videoId=${chapter.video_id}`);
          const data = await response.json();

          loading.classList.add('hidden');

          if (data.success && data.result && data.result.video_url) {
              videoPlayer.src = data.result.video_url;
              videoPlayer.play();
          } else {
              error.classList.remove('hidden');
          }
      } catch (err) {
          loading.classList.add('hidden');
          error.classList.remove('hidden');
      }
  }

  function showError(message) {
    heroSection.innerHTML = `<div class="loading-state">${message}</div>`;
    videoGrid.innerHTML = '';
  }

  // Navbar background change on scroll
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(0,0,0,0.9)';
    } else {
      navbar.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)';
    }
  });

  // Init
  fetchDramas();
});
