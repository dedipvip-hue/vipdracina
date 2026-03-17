const DEFAULT_API_KEY = "Ferdiz-AFK";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- Key Management ---
    let API_KEY_VAL = null;
    if (env.dracin) {
      try {
        const obj = await env.dracin.get("API_KEY");
        if (obj) {
          API_KEY_VAL = (await obj.text()).trim();
        }
      } catch (e) {
        console.error("Failed to read from R2", e);
      }
    }

    if (!API_KEY_VAL) {
      API_KEY_VAL = env.API_KEY || DEFAULT_API_KEY;
    }

    // --- Proxy endpoints ---
    if (url.pathname === "/api/key" && request.method === "POST") {
      try {
        const body = await request.json();
        const newKey = body.key;
        if (!newKey) return new Response(JSON.stringify({ success: false, message: "Key tidak boleh kosong" }), { status: 400 });

        // Test the key against the API
        const testUrl = `https://api.ferdev.my.id/internet/melolo/search?query=CEO&apikey=${newKey}`;
        const testRes = await fetch(testUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const testData = await testRes.json();

        if (testData.success === false && testData.status === 403) {
            return new Response(JSON.stringify({ success: false, message: "API Key Tidak Valid!" }), { status: 403 });
        }

        // Save to R2
        if (env.dracin) {
          await env.dracin.put("API_KEY", newKey);
          return new Response(JSON.stringify({ success: true, message: "API Key berhasil disimpan dan terhubung!" }));
        } else {
          return new Response(JSON.stringify({ success: false, message: "R2 Bucket 'dracin' tidak ditemukan di environment." }), { status: 500 });
        }
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: "Gagal memproses permintaan: " + err.message }), { status: 500 });
      }
    }

    if (url.pathname === "/api/drakor") {
      const query = url.searchParams.get("query") || "CEO";
      const apiUrl = `https://api.ferdev.my.id/internet/melolo/search?query=${encodeURIComponent(query)}&apikey=${API_KEY_VAL}`;
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
      const apiUrl = `https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${API_KEY_VAL}`;
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
      const apiUrl = `https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=${API_KEY_VAL}`;
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

    // --- Serve Frontend HTML ---
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIPDRACINA</title>
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --primary: #e50914;
      --bg-color: #141414;
      --text-main: #ffffff;
      --text-muted: #aaaaaa;
      --hover-bg: #2f2f2f;
      --card-bg: #181818;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: var(--bg-color);
      color: var(--text-main);
      overflow-x: hidden;
    }

    /* Navbar */
    .navbar {
      position: fixed;
      top: 0;
      width: 100%;
      padding: 20px 4%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
      z-index: 1000;
      transition: background 0.3s;
    }

    .logo {
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 2px;
      color: var(--primary);
    }

    .logo span { color: var(--text-main); }

    .nav-actions {
      display: flex;
      gap: 20px;
      align-items: center;
    }

    .nav-icon {
      color: var(--text-main);
      font-size: 20px;
      cursor: pointer;
    }

    /* Hero Section */
    .hero {
      position: relative;
      height: 80vh;
      width: 100%;
      background-size: cover;
      background-position: center top;
      display: flex;
      align-items: flex-end;
      padding: 0 4% 10vh 4%;
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
      opacity: 0.7;
    }

    .hero::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to top, var(--bg-color) 0%, transparent 100%);
      z-index: 1;
    }

    .hero-content {
      position: relative;
      z-index: 2;
      max-width: 600px;
    }

    .hero-title {
      font-size: 3rem;
      font-weight: 800;
      margin-bottom: 15px;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
    }

    .hero-meta {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
      font-size: 14px;
      color: #ccc;
      font-weight: 600;
    }

    .hero-desc {
      font-size: 1.1rem;
      line-height: 1.5;
      margin-bottom: 25px;
      color: #ddd;
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

    .play-btn, .info-btn {
      padding: 12px 28px;
      border-radius: 4px;
      font-size: 1.1rem;
      font-weight: bold;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      transition: all 0.2s;
    }

    .play-btn {
      background-color: var(--text-main);
      color: #000;
    }

    .play-btn:hover { background-color: rgba(255,255,255,0.7); }

    .info-btn {
      background-color: rgba(109, 109, 110, 0.7);
      color: var(--text-main);
    }

    .info-btn:hover { background-color: rgba(109, 109, 110, 0.4); }

    /* Content Rows */
    .content-section {
      padding: 20px 4%;
      position: relative;
      z-index: 2;
      margin-top: -50px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 15px;
    }

    .section-title {
      font-size: 24px;
      font-weight: bold;
    }

    .see-all {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 14px;
      transition: color 0.2s;
      cursor: pointer;
    }

    .see-all:hover { color: var(--text-main); }

    .video-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 15px;
    }

    .video-card {
      position: relative;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      aspect-ratio: 2/3;
      background: var(--card-bg);
      transition: transform 0.3s ease;
    }

    .video-card:hover {
      transform: scale(1.05);
      z-index: 10;
      box-shadow: 0 10px 20px rgba(0,0,0,0.8);
    }

    .video-thumbnail {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .play-icon-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 40px;
      color: rgba(255,255,255,0.8);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .video-card:hover .play-icon-overlay { opacity: 1; }

    .video-info {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      padding: 20px 10px 10px;
      background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
      color: white;
    }

    .video-title {
      font-size: 14px;
      font-weight: bold;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 5px;
    }

    .video-stats {
      font-size: 12px;
      color: var(--text-muted);
    }

    /* Modal / Detail View */
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.9);
      z-index: 2000;
      display: none;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(5px);
    }

    .modal-overlay.active { display: flex; }

    .modal-content {
      background: var(--card-bg);
      width: 90%;
      max-width: 900px;
      max-height: 90vh;
      border-radius: 10px;
      overflow-y: auto;
      position: relative;
      box-shadow: 0 0 30px rgba(0,0,0,0.8);
      padding: 30px;
    }

    .modal-close {
      position: absolute;
      top: 15px;
      right: 20px;
      font-size: 28px;
      color: white;
      cursor: pointer;
      z-index: 10;
      background: rgba(0,0,0,0.5);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 2px solid transparent;
    }

    .modal-close:hover { border-color: white; }

    .player-container {
      width: 100%;
      aspect-ratio: 16/9;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 20px;
      position: relative;
    }

    video { width: 100%; height: 100%; object-fit: contain; }

    .modal-header { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }

    .modal-poster {
      width: 150px;
      border-radius: 6px;
      object-fit: cover;
      aspect-ratio: 2/3;
    }

    .modal-info { flex: 1; }

    .modal-title { font-size: 2rem; margin-bottom: 10px; }

    .modal-meta { display: flex; gap: 15px; color: var(--text-muted); margin-bottom: 15px; font-size: 14px; }

    .modal-desc { line-height: 1.6; color: #ddd; font-size: 15px; }

    .episode-list { margin-top: 20px; }

    .episodes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
      gap: 10px;
      margin-top: 15px;
    }

    .loading-state {
      text-align: center;
      padding: 50px;
      color: var(--text-muted);
      font-size: 1.2rem;
    }


    /* Settings Modal */
    .settings-modal {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8);
      z-index: 3000;
      display: none;
      justify-content: center;
      align-items: center;
    }
    .settings-modal.active { display: flex; }
    .settings-content {
      background: var(--card-bg);
      padding: 30px;
      border-radius: 8px;
      width: 90%;
      max-width: 400px;
      text-align: center;
      position: relative;
    }
    .settings-content h2 { margin-bottom: 20px; }
    .settings-input {
      width: 100%;
      padding: 12px;
      border-radius: 4px;
      border: 1px solid #333;
      background: #111;
      color: white;
      margin-bottom: 20px;
      font-size: 16px;
    }
    .settings-btn {
      background-color: var(--primary);
      color: white;
      border: none;
      padding: 12px 20px;
      width: 100%;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: bold;
    }
    .settings-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .settings-close {
      position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; color: #888;
    }
    .notification {
      margin-top: 15px;
      font-size: 14px;
      padding: 10px;
      border-radius: 4px;
      display: none;
    }
    .notification.success { background: rgba(0, 255, 0, 0.1); color: #0f0; border: 1px solid #0f0; display: block; }
    .notification.error { background: rgba(255, 0, 0, 0.1); color: #f00; border: 1px solid #f00; display: block; }

    .hidden { display: none !important; }

    @media (max-width: 768px) {
      .hero-title { font-size: 2rem; }
      .video-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
      .modal-header { flex-direction: column; }
      .modal-poster { width: 100px; }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo">VIP<span>DRACINA</span></div>
    <div class="nav-actions">
      <i class="fas fa-search nav-icon" id="searchBtn"></i>
      <i class="fas fa-cog nav-icon" id="settingsBtn" title="Pengaturan API"></i>
      <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="Profile" style="width: 32px; border-radius: 4px; cursor: pointer;">
    </div>
  </nav>


  <!-- Settings Modal -->
  <div class="settings-modal" id="settingsModal">
    <div class="settings-content">
      <span class="settings-close" id="settingsClose">&times;</span>
      <h2>Pengaturan API Key</h2>
      <p style="font-size: 14px; color: #aaa; margin-bottom: 15px;">Masukkan API Key dari ferdev.my.id</p>
      <input type="text" id="apiKeyInput" class="settings-input" placeholder="Ferdiz-AFK">
      <button id="saveApiKeyBtn" class="settings-btn">Simpan & Hubungkan</button>
      <div id="apiNotification" class="notification"></div>
    </div>
  </div>

  <section class="hero" id="heroSection">
    <div class="loading-state">Memuat data terbaru...</div>
  </section>

  <section class="content-section">
    <div class="section-header">
      <h2 class="section-title">Rekomendasi Untukmu</h2>
      <a href="#" class="see-all">Lihat Semua <i class="fas fa-chevron-right"></i></a>
    </div>
    <div class="video-grid" id="videoGrid"></div>
  </section>

  <script>
    document.addEventListener('DOMContentLoaded', () => {

      // Settings logic
      const settingsBtn = document.getElementById('settingsBtn');
      const settingsModal = document.getElementById('settingsModal');
      const settingsClose = document.getElementById('settingsClose');
      const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
      const apiKeyInput = document.getElementById('apiKeyInput');
      const apiNotification = document.getElementById('apiNotification');

      settingsBtn.addEventListener('click', () => {
        settingsModal.classList.add('active');
      });

      settingsClose.addEventListener('click', () => {
        settingsModal.classList.remove('active');
        apiNotification.className = 'notification';
      });

      saveApiKeyBtn.addEventListener('click', async () => {
        const key = apiKeyInput.value.trim();
        if (!key) {
           apiNotification.textContent = "API Key tidak boleh kosong!";
           apiNotification.className = "notification error";
           return;
        }

        saveApiKeyBtn.disabled = true;
        saveApiKeyBtn.textContent = "Menghubungkan...";
        apiNotification.className = "notification";

        try {
          const res = await fetch('/api/key', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key })
          });
          const data = await res.json();

          if (res.ok && data.success) {
            apiNotification.textContent = data.message;
            apiNotification.className = "notification success";
            setTimeout(() => {
               settingsModal.classList.remove('active');
               apiNotification.className = "notification";
               fetchDramas(); // reload data
            }, 2000);
          } else {
            apiNotification.textContent = data.message || "Gagal menghubungkan.";
            apiNotification.className = "notification error";
          }
        } catch(e) {
            apiNotification.textContent = "Terjadi kesalahan jaringan.";
            apiNotification.className = "notification error";
        } finally {
            saveApiKeyBtn.disabled = false;
            saveApiKeyBtn.textContent = "Simpan & Hubungkan";
        }
      });

      const heroSection = document.getElementById('heroSection');
      const videoGrid = document.getElementById('videoGrid');

      const modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.innerHTML = \`
        <div class="modal-content">
          <span class="modal-close">&times;</span>
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
