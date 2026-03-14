document.addEventListener('DOMContentLoaded', () => {
  const heroSection = document.getElementById('hero-section');
  const videoGrid = document.getElementById('video-grid');

  // Create modal element
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <button class="close-modal"><i class="fas fa-times"></i></button>
      <iframe class="player" allowfullscreen allow="autoplay; encrypted-media"></iframe>
    </div>
  `;
  document.body.appendChild(modal);

  const closeModalBtn = modal.querySelector('.close-modal');
  const videoPlayer = modal.querySelector('.player');

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
    videoPlayer.src = '';
  });

  // Close on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      videoPlayer.src = '';
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
      const response = await fetch('/api/random', {
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
          console.error("Failed to parse API response", text.substring(0, 100));
          throw new Error("Failed to parse API response");
      }

      // Handle case where root is array directly
      if (Array.isArray(data)) {
          data = { data: data };
      }

      if (data && data.data && data.data.length > 0) {
        renderDramas(data.data);
      } else {
        showError('Tidak ada drama ditemukan');
      }
    } catch (error) {
      console.error('Error fetching dramas:', error);
      showError('Gagal memuat drama. Silakan coba lagi nanti.');
    }
  }

  function renderDramas(dramas) {
    // Separate first item for hero section
    const heroDrama = dramas[0];
    const gridDramas = dramas.slice(1);

    // Fallbacks if not enough data
    const listToRender = gridDramas.length > 0 ? gridDramas : dramas;

    // Render Hero
    renderHero(heroDrama);

    // Render Grid
    renderGrid(listToRender);
  }

  function renderHero(drama) {
    const videoUrl = extractVideoUrl(drama);

    heroSection.innerHTML = `
      <div class="hero-video-container">
        <img src="${escapeHTML(drama.bookCover || drama.chapterImg)}" alt="${escapeHTML(drama.bookName)}">
      </div>
      <div class="hero-content">
        <h1 class="hero-title">${escapeHTML(drama.bookName)}</h1>
        <div class="hero-meta">
          <span><i class="fas fa-play"></i> ${escapeHTML(drama.playCount || '1M+')} tayangan</span>
          <span><i class="fas fa-list"></i> ${escapeHTML(drama.totalChapterNum || '?')} Episode</span>
        </div>
        <div class="hero-tags">
          ${(drama.tags || []).slice(0, 3).map(tag => `<span class="tag">${escapeHTML(tag)}</span>`).join('')}
        </div>
        <p class="hero-desc">${escapeHTML(drama.introduction || '')}</p>
        <div class="hero-actions">
          <button class="play-btn" data-video="${escapeHTML(videoUrl)}">
            <i class="fas fa-play"></i> Mulai Nonton
          </button>
          <button class="info-btn">
            <i class="fas fa-info-circle"></i> Detail
          </button>
        </div>
      </div>
    `;

    const playBtn = heroSection.querySelector('.play-btn');
    playBtn.addEventListener('click', (e) => {
      const url = e.currentTarget.getAttribute('data-video');
      playVideo(url);
    });
  }

  function renderGrid(dramas) {
    videoGrid.innerHTML = '';

    dramas.forEach(drama => {
      const videoUrl = extractVideoUrl(drama);

      const card = document.createElement('div');
      card.className = 'video-card';
      card.innerHTML = `
        <img class="video-thumbnail" src="${escapeHTML(drama.bookCover || drama.chapterImg)}" alt="${escapeHTML(drama.bookName)}">
        <div class="play-icon-overlay">
          <i class="fas fa-play"></i>
        </div>
        <div class="video-info">
          <h3 class="video-title" title="${escapeHTML(drama.bookName)}">${escapeHTML(drama.bookName)}</h3>
          <div class="video-stats">
            <i class="fas fa-eye"></i> ${escapeHTML(drama.playCount || 'N/A')}
          </div>
        </div>
      `;

      card.addEventListener('click', () => {
        playVideo(videoUrl);
      });

      videoGrid.appendChild(card);
    });
  }

  function extractVideoUrl(drama) {
    // The raw video files are DRM-encrypted (.encrypt.mp4) via Aliyun Media Transcoding
    // and cannot be played directly via standard HTML5 <video> tags.
    // However, the API provides a "shareVo.link" which serves as an embeddable web player.
    if (drama.shareVo && drama.shareVo.link) {
        return drama.shareVo.link;
    }

    // Fallback if no share link is provided
    return `https://sharet.dramabox.com/play?bid=${drama.bookId}&lan=in`;
  }

  function playVideo(url) {
    if (!url) {
      alert('Video tidak tersedia');
      return;
    }

    videoPlayer.src = url;
    modal.classList.add('active');
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