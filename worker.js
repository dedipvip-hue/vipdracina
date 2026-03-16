const DEFAULT_API_KEY = "Ferdiz-AFK";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Get API Key from environment variable or use default
    const apiKey = env.API_KEY || DEFAULT_API_KEY;

    // --- Proxy endpoints ---
    if (url.pathname === "/api/drakor") {
      const query = url.searchParams.get("query") || "CEO";
      const apiUrl = `https://api.ferdev.my.id/internet/melolo/search?query=${encodeURIComponent(query)}&apikey=${apiKey}`;
      try {
        const response = await fetch(apiUrl, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0"
          }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { "content-type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    if (url.pathname === "/api/detail") {
      const bookId = url.searchParams.get("bookId");
      if (!bookId) return new Response("Missing bookId", { status: 400 });
      const apiUrl = `https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${apiKey}`;
      try {
        const response = await fetch(apiUrl, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0"
          }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { "content-type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    if (url.pathname === "/api/stream") {
      const videoId = url.searchParams.get("videoId");
      if (!videoId) return new Response("Missing videoId", { status: 400 });
      const apiUrl = `https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=${apiKey}`;
      try {
        const response = await fetch(apiUrl, {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0"
          }
        });
        const data = await response.json();
        return new Response(JSON.stringify(data), {
          headers: { "content-type": "application/json" },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        });
      }
    }

    // --- HTML Frontend ---
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIPDRACINA - Nonton Drama Eksklusif</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --primary: #e50914;
      --bg-dark: #141414;
      --bg-light: #181818;
      --text-main: #ffffff;
      --text-muted: #aaaaaa;
    }
    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      overflow-x: hidden;
    }
    a {
      text-decoration: none;
      color: inherit;
    }

    /* Navbar */
    .navbar {
      position: fixed;
      top: 0;
      width: 100%;
      height: 70px;
      display: flex;
      align-items: center;
      padding: 0 4%;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
      z-index: 1000;
      box-sizing: border-box;
      transition: background 0.3s ease;
    }
    .brand {
      font-size: 24px;
      font-weight: bold;
      color: var(--primary);
      margin-right: 40px;
      letter-spacing: 1px;
    }
    .brand span {
      color: var(--text-main);
    }
    .nav-links {
      display: flex;
      gap: 20px;
      flex-grow: 1;
    }
    .nav-links a {
      font-size: 14px;
      transition: color 0.3s;
    }
    .nav-links a:hover {
      color: var(--text-muted);
    }
    .nav-actions {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .nav-actions i {
      font-size: 18px;
      cursor: pointer;
    }

    /* Hero Section */
    .hero {
      position: relative;
      width: 100%;
      height: 80vh;
      min-height: 500px;
      background: var(--bg-light);
      display: flex;
      align-items: center;
      overflow: hidden;
    }
    .hero-video-container {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
    .hero-video-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.5;
    }
    .hero-video-container::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to right, rgba(20,20,20,1) 0%, rgba(20,20,20,0.4) 50%, rgba(20,20,20,0) 100%),
                  linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0) 30%);
    }
    .hero-content {
      position: relative;
      z-index: 1;
      width: 50%;
      padding-left: 4%;
    }
    .hero-title {
      font-size: 3.5rem;
      margin: 0 0 10px 0;
      line-height: 1.1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }
    .hero-meta {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      font-size: 14px;
      color: var(--text-muted);
    }
    .hero-desc {
      font-size: 1.2rem;
      line-height: 1.5;
      margin-bottom: 30px;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
    }
    .hero-actions {
      display: flex;
      gap: 15px;
    }
    .hero-actions button {
      padding: 10px 24px;
      font-size: 1.1rem;
      font-weight: bold;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: opacity 0.2s;
    }
    .play-btn {
      background-color: white;
      color: black;
    }
    .play-btn:hover {
      background-color: rgba(255,255,255,0.8);
    }
    .info-btn {
      background-color: rgba(109, 109, 110, 0.7);
      color: white;
    }
    .info-btn:hover {
      background-color: rgba(109, 109, 110, 0.9);
    }

    /* Video Grid */
    .section {
      padding: 0 4% 50px 4%;
      position: relative;
      z-index: 2;
      margin-top: -50px;
    }
    .section-title {
      font-size: 1.5rem;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-title span {
      font-size: 14px;
      color: var(--text-muted);
      cursor: pointer;
    }
    .section-title span:hover {
      color: white;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
    }
    .video-card {
      position: relative;
      border-radius: 5px;
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 9/13;
      background: #222;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .video-card:hover {
      transform: scale(1.05);
      z-index: 3;
      box-shadow: 0 10px 20px rgba(0,0,0,0.8);
    }
    .video-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s;
    }
    .video-card:hover .video-thumbnail {
      opacity: 0.6;
    }
    .play-icon-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.5);
      font-size: 3rem;
      color: white;
      opacity: 0;
      transition: all 0.3s ease;
    }
    .video-card:hover .play-icon-overlay {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    .video-info {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 10px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%);
      box-sizing: border-box;
    }
    .video-title {
      font-size: 14px;
      font-weight: bold;
      margin: 0 0 5px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .video-stats {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Modal Styling */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 2000;
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      overflow-y: auto;
      padding: 20px;
    }
    .modal.active {
      opacity: 1;
      pointer-events: auto;
    }
    .modal-content {
      background: var(--bg-light);
      width: 90%;
      max-width: 900px;
      border-radius: 10px;
      position: relative;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(0,0,0,0.5);
    }
    .modal-close {
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 24px;
      color: white;
      background: rgba(0,0,0,0.5);
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      z-index: 10;
      transition: background 0.3s;
    }
    .modal-close:hover {
      background: rgba(255,255,255,0.2);
    }

    .modal-header {
      display: flex;
      padding: 40px;
      gap: 30px;
      background: linear-gradient(to bottom, #2a2a2a 0%, var(--bg-light) 100%);
    }

    .modal-poster {
      width: 200px;
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0,0,0,0.5);
    }

    .modal-info {
      flex-grow: 1;
    }
    .modal-title {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
    }
    .modal-meta {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      color: #aaa;
      font-size: 14px;
    }
    .modal-desc {
      line-height: 1.6;
      color: #ddd;
      margin-bottom: 20px;
    }

    .episode-list {
      padding: 0 40px 40px 40px;
    }
    .episode-list h3 {
      font-size: 1.2rem;
      margin-bottom: 20px;
      border-bottom: 1px solid #333;
      padding-bottom: 10px;
    }

    .episodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 10px;
      max-height: 300px;
      overflow-y: auto;
      padding-right: 10px;
    }

    /* Player Container */
    .player-container {
      width: 100%;
      background: #000;
      position: relative;
    }

    .player-container video {
      width: 100%;
      max-height: 60vh;
      outline: none;
    }

    .hidden { display: none !important; }

    /* Custom Scrollbar */
    ::-webkit-scrollbar {
      width: 8px;
    }
    ::-webkit-scrollbar-track {
      background: #141414;
    }
    ::-webkit-scrollbar-thumb {
      background: #333;
      border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #555;
    }

    .loading-state {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 200px;
      font-size: 1.2rem;
      color: var(--text-muted);
    }

    /* Responsive */
    @media (max-width: 768px) {
      .hero-content {
        width: 90%;
      }
      .hero-title {
        font-size: 2rem;
      }
      .modal-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 20px;
      }
      .modal-poster {
        width: 150px;
      }
      .episode-list {
        padding: 0 20px 20px 20px;
      }
      .nav-links {
        display: none;
      }
    }
  </style>
</head>
<body>

  <!-- Navbar -->
  <nav class="navbar">
    <div class="brand">VIP<span>DRACINA</span></div>
    <div class="nav-links">
      <a href="#">Beranda</a>
      <a href="#">Eksklusif</a>
      <a href="#">Terbaru</a>
      <a href="#">Kategori</a>
    </div>
    <div class="nav-actions">
      <i class="fas fa-search"></i>
    </div>
  </nav>

  <!-- Hero Section -->
  <header class="hero" id="hero-section">
    <div class="loading-state">
      <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-right: 10px;"></i>
      Memuat VIPDRACINA...
    </div>
  </header>

  <!-- Video Grid -->
  <section class="section">
    <div class="section-title">
      <h2>Rekomendasi Untukmu</h2>
      <span>Lihat Semua <i class="fas fa-chevron-right"></i></span>
    </div>
    <div class="grid" id="video-grid">
      <!-- Cards injected by JS -->
    </div>
  </section>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const heroSection = document.getElementById('hero-section');
      const videoGrid = document.getElementById('video-grid');

      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = \`
        <div class="modal-content">
          <div class="modal-close"><i class="fas fa-times"></i></div>

          <div id="player-container" class="player-container hidden">
            <video id="videoPlayer" controls autoplay ></video>
            <div id="playerLoading" class="loading-state hidden">Memuat video...</div>
            <div id="playerError" class="loading-state hidden" style="color: red;">Gagal memuat video</div>
          </div>

          <div class="modal-header">
            <img class="modal-poster" id="modalPoster" src="" alt="Poster" referrerpolicy="no-referrer">
            <div class="modal-info">
              <h2 class="modal-title" id="modalTitle">Judul</h2>
              <div class="modal-meta">
                <span id="modalStatus">Status</span>
                <span>•</span>
                <span id="modalChapters">0 Eps</span>
              </div>
              <p class="modal-desc" id="modalSynopsis">Sinopsis...</p>
            </div>
          </div>

          <div class="episode-list">
            <h3>Pilih Episode</h3>
            <div id="episodeGridLoading" class="loading-state hidden">Memuat episode...</div>
            <div class="episodes-grid" id="episodeGrid"></div>
          </div>
        </div>
      \`;
      document.body.appendChild(modal);

      const videoPlayer = document.getElementById('videoPlayer');

      modal.querySelector('.modal-close').addEventListener('click', () => {
        modal.classList.remove('active');
        if (videoPlayer) {
          videoPlayer.pause();
          videoPlayer.src = '';
          document.getElementById('player-container').classList.add('hidden');
        }
      });

      function escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      }

      async function fetchDramas() {
        try {
          const proxyUrl = \`/api/drakor?query=CEO\`;

          const response = await fetch(proxyUrl);
          const data = await response.json();
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
        heroSection.innerHTML = \`
          <div class="hero-video-container">
            <img src="\${escapeHTML(drama.cover)}" alt="\${escapeHTML(drama.title)}" referrerpolicy="no-referrer">
          </div>
          <div class="hero-content">
            <h1 class="hero-title">\${escapeHTML(drama.title)}</h1>
            <div class="hero-meta">
              <span><i class="fas fa-list"></i> \${escapeHTML(drama.total_chapters || '?')} Episode</span>
              <span><i class="fas fa-info-circle"></i> \${escapeHTML(drama.status || 'Ongoing')}</span>
            </div>
            <p class="hero-desc">\${escapeHTML(drama.sinopsis || 'Tidak ada sinopsis.')}</p>
            <div class="hero-actions">
              <button class="info-btn" data-id="\${escapeHTML(drama.book_id)}">
                <i class="fas fa-info-circle"></i> Detail & Episode
              </button>
            </div>
          </div>
        \`;

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
          card.innerHTML = \`
            <img class="video-thumbnail" src="\${escapeHTML(drama.cover)}" alt="\${escapeHTML(drama.title)}" referrerpolicy="no-referrer">
            <div class="play-icon-overlay"><i class="fas fa-info-circle"></i></div>
            <div class="video-info">
              <h3 class="video-title" title="\${escapeHTML(drama.title)}">\${escapeHTML(drama.title)}</h3>
              <div class="video-stats"><i class="fas fa-list"></i> \${escapeHTML(drama.total_chapters || 'N/A')} Eps</div>
            </div>
          \`;
          card.addEventListener('click', () => openDetail(drama));
          videoGrid.appendChild(card);
        });
      }

      async function openDetail(item) {
          document.getElementById('modalTitle').innerText = item.title;
          document.getElementById('modalPoster').src = item.cover;
          document.getElementById('modalSynopsis').innerText = item.sinopsis || 'Tidak ada sinopsis.';
          document.getElementById('modalStatus').innerText = item.status || 'Ongoing';
          document.getElementById('modalChapters').innerText = \`\${item.total_chapters || 0} Episodes\`;

          document.getElementById('player-container').classList.add('hidden');
          videoPlayer.pause();
          videoPlayer.src = '';

          document.getElementById('episodeGrid').innerHTML = '';
          document.getElementById('episodeGridLoading').classList.remove('hidden');
          modal.classList.add('active');

          try {
              const proxyUrl = \`/api/detail?bookId=\${item.book_id}\`;
              const response = await fetch(proxyUrl);
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
              const proxyUrl = \`/api/stream?videoId=\${chapter.video_id}\`;
              const response = await fetch(proxyUrl);
              const data = await response.json();

              loading.classList.add('hidden');

              let videoUrl = null;
              if (data.success && data.result) {
                  if (data.result.video_url) {
                      videoUrl = data.result.video_url;
                  } else if (data.result.videoPath) {
                      videoUrl = data.result.videoPath;
                  }
              }

              if (videoUrl) {
                  videoPlayer.src = videoUrl;
                  videoPlayer.play().catch(e => {
                      console.error("Video play error:", e);
                      error.innerText = "Error playing video: " + e.message;
                      error.classList.remove('hidden');
                  });
              } else {
                  error.classList.remove('hidden');
              }
          } catch (err) {
              loading.classList.add('hidden');
              error.classList.remove('hidden');
          }
      }

      function showError(message) {
        heroSection.innerHTML = \`<div class="loading-state">\${message}</div>\`;
        videoGrid.innerHTML = '';
      }

      window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(0,0,0,0.9)';
        } else {
          navbar.style.background = 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)';
        }
      });

      fetchDramas();
    });
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
      },
    });
  },
};
