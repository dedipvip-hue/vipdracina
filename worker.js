const DEFAULT_API_KEY = "dedi131";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // --- Key Management ---
    let API_KEY_VAL = null;
    let isCustomKey = false;

    if (env.BUCKET) {
      try {
        const obj = await env.BUCKET.get("API_KEY");
        if (obj) {
          API_KEY_VAL = (await obj.text()).trim();
          isCustomKey = true;
        }
      } catch (e) {
        console.error("Failed to read from R2", e);
      }
    }

    if (!API_KEY_VAL) {
      API_KEY_VAL = env.API_KEY || DEFAULT_API_KEY;
    }

    // --- Settings API (matching apkmod) ---
    if (url.pathname === "/api/settings") {
      if (!env.BUCKET)
        return new Response(
          JSON.stringify({
            success: false,
            message: "R2 Bucket not configured",
          }),
          { headers: { "content-type": "application/json" } },
        );
      if (request.method === "GET") {
        return new Response(JSON.stringify({ configured: isCustomKey }), {
          headers: { "content-type": "application/json" },
        });
      }
      if (request.method === "POST") {
        try {
          const body = await request.json();
          if (body.key) {
            await env.BUCKET.put("API_KEY", body.key.trim());
            return new Response(JSON.stringify({ success: true }), {
              headers: { "content-type": "application/json" },
            });
          }
          return new Response(
            JSON.stringify({ success: false, message: "Missing key" }),
            { headers: { "content-type": "application/json" } },
          );
        } catch (e) {
          return new Response(
            JSON.stringify({ success: false, message: e.message }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      }
      if (request.method === "DELETE") {
        try {
          await env.BUCKET.delete("API_KEY");
          return new Response(JSON.stringify({ success: true }), {
            headers: { "content-type": "application/json" },
          });
        } catch (e) {
          return new Response(
            JSON.stringify({ success: false, message: e.message }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }
      }
    }

    // --- Worker Proxy API ---
    if (url.pathname.startsWith("/api/")) {
      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
      };

      try {
        let apiUrl = "";
        if (url.pathname === "/api/drakor") {
          const query = url.searchParams.get("query") || "CEO";
          apiUrl = `https://api.ferdev.my.id/internet/melolo/search?query=${query}&apikey=${API_KEY_VAL}`;
        } else if (url.pathname === "/api/detail") {
          const bookId = url.searchParams.get("bookId");
          apiUrl = `https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=${API_KEY_VAL}`;
        } else if (url.pathname === "/api/stream") {
          const videoId = url.searchParams.get("videoId");
          apiUrl = `https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=${API_KEY_VAL}`;
        } else {
          return new Response(JSON.stringify({ error: "Endpoint not found" }), {
            status: 404,
            headers: corsHeaders,
          });
        }

        const response = await fetch(apiUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          },
        });

        const data = await response.arrayBuffer();
        return new Response(data, { headers: corsHeaders });
      } catch (error) {
        return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
          status: 500,
          headers: corsHeaders,
        });
      }
    }

    // --- Serve HTML/CSS/JS exactly like apkmod (single file injection) ---
    const html = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VIPDRACINA - Nonton Drama Gratis</title>
  <meta name="description" content="Tonton drama terbaru gratis dan premium.">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <style>
    :root {
      --primary-color: #e50914;
      --bg-color: #141414;
      --text-color: #ffffff;
      --nav-bg: rgba(20, 20, 20, 0.95);
      --card-bg: #2f2f2f;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
    body { background-color: var(--bg-color); color: var(--text-color); overflow-x: hidden; }

    /* Navbar */
    .navbar { position: fixed; top: 0; width: 100%; padding: 20px 50px; display: flex; justify-content: space-between; align-items: center; background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%); z-index: 1000; transition: background 0.3s; }
    .logo { font-size: 24px; font-weight: 800; letter-spacing: 1px; }
    .vip { color: var(--primary-color); }
    .nav-links { display: flex; gap: 30px; }
    .nav-links a { color: #e5e5e5; text-decoration: none; font-size: 14px; font-weight: 500; transition: color 0.3s; }
    .nav-links a:hover, .nav-links a.active { color: var(--text-color); font-weight: 600; }
    .nav-right { display: flex; align-items: center; gap: 20px; }
    .search-btn { background: none; border: none; color: white; font-size: 18px; cursor: pointer; }
    .login-btn { background-color: var(--primary-color); color: white; border: none; padding: 8px 20px; border-radius: 4px; font-weight: 600; cursor: pointer; transition: background 0.3s; }
    .login-btn:hover { background-color: #f40612; }

    /* Hero Section */
    .hero-section { position: relative; height: 80vh; width: 100%; display: flex; align-items: center; }
    .hero-video-container { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; }
    .hero-video-container::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to right, rgba(20,20,20,1) 0%, rgba(20,20,20,0.4) 50%, rgba(20,20,20,1) 100%), linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0) 50%); }
    .hero-video-container img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.6); }
    .hero-content { position: relative; z-index: 10; padding: 0 50px; max-width: 600px; margin-top: 100px; }
    .hero-title { font-size: 3rem; font-weight: 800; margin-bottom: 15px; line-height: 1.2; }
    .hero-meta { display: flex; gap: 15px; margin-bottom: 15px; color: #a3a3a3; font-size: 0.9rem; }
    .hero-tags { display: flex; gap: 10px; margin-bottom: 20px; }
    .tag { background: rgba(255,255,255,0.2); padding: 3px 10px; border-radius: 3px; font-size: 0.8rem; }
    .hero-desc { font-size: 1rem; line-height: 1.5; color: #d2d2d2; margin-bottom: 30px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .hero-actions { display: flex; gap: 15px; }
    .hero-actions button { padding: 10px 24px; border-radius: 4px; font-size: 1.1rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: transform 0.2s, background 0.3s; border: none; }
    .play-btn { background-color: var(--text-color); color: black; }
    .play-btn:hover { background-color: rgba(255,255,255,0.8); transform: scale(1.05); }
    .info-btn { background-color: rgba(109, 109, 110, 0.7); color: white; }
    .info-btn:hover { background-color: rgba(109, 109, 110, 0.9); transform: scale(1.05); }

    /* Feed Section */
    .feed-section { padding: 40px 50px; position: relative; z-index: 10; margin-top: -100px; }
    .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; }
    .section-header h2 { font-size: 1.4rem; font-weight: 600; }
    .view-all { color: #a3a3a3; text-decoration: none; font-size: 0.9rem; transition: color 0.3s; }
    .view-all:hover { color: white; }
    .video-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; }
    .video-card { background: var(--card-bg); border-radius: 8px; overflow: hidden; cursor: pointer; transition: transform 0.3s; position: relative; }
    .video-card:hover { transform: scale(1.05); z-index: 2; }
    .video-thumbnail { width: 100%; aspect-ratio: 2/3; object-fit: cover; }
    .play-icon-overlay { position: absolute; top: 0; left: 0; width: 100%; height: calc(100% - 60px); background: rgba(0,0,0,0.4); display: flex; justify-content: center; align-items: center; opacity: 0; transition: opacity 0.3s; }
    .play-icon-overlay i { font-size: 3rem; color: white; filter: drop-shadow(0 0 10px rgba(0,0,0,0.5)); }
    .video-card:hover .play-icon-overlay { opacity: 1; }
    .video-info { padding: 10px; }
    .video-title { font-size: 0.9rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 5px; }
    .video-stats { font-size: 0.8rem; color: #a3a3a3; display: flex; align-items: center; gap: 5px; }

    /* Modal Player */
    .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; justify-content: center; align-items: center; }
    .modal.active { display: flex; }
    .modal-content { width: 80%; max-width: 1000px; background: #181818; border-radius: 10px; position: relative; overflow: hidden; box-shadow: 0 0 30px rgba(0,0,0,0.8); }
    .close-modal { position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.5); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; z-index: 10; transition: background 0.3s; display: flex; justify-content: center; align-items: center; }
    .close-modal:hover { background: var(--primary-color); }
    .loading-state { width: 100%; text-align: center; padding: 50px; color: #a3a3a3; font-size: 1.2rem; }
    .hidden { display: none !important; }

    /* Footer */
    footer { margin-top: 50px; padding: 50px; background: #000; text-align: center; }
    .footer-content { max-width: 600px; margin: 0 auto; }
    .footer-content p { color: #a3a3a3; margin: 20px 0; }
    .social-links { display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; }
    .social-links a { color: white; font-size: 1.5rem; transition: color 0.3s; }
    .social-links a:hover { color: var(--primary-color); }
    .footer-bottom { color: #555; font-size: 0.9rem; border-top: 1px solid #333; padding-top: 20px; }

    /* Responsive */
    @media (max-width: 768px) {
      .navbar { padding: 15px 20px; }
      .nav-links { display: none; }
      .hero-content { padding: 0 20px; }
      .hero-title { font-size: 2rem; }
      .feed-section { padding: 20px; }
      .video-grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
      .modal-content { width: 95%; }
    }
  </style>
</head>
<body>
  <nav class="navbar">
    <div class="logo"><span class="vip">VIP</span>DRACINA</div>
    <div class="nav-links">
      <a href="#" class="active">Beranda</a>
      <a href="#">Eksklusif</a>
      <a href="#">Terbaru</a>
      <a href="#">Kategori</a>
    </div>
    <div class="nav-right">
      <button class="search-btn"><i class="fas fa-search"></i></button>
      <button class="login-btn" onclick="openSettings()"><i class="fas fa-cog"></i></button>
    </div>
  </nav>

  <main>
    <div class="hero-section" id="hero-section">
      <div class="loading-state">Memuat drama...</div>
    </div>

    <section class="feed-section">
      <div class="section-header">
        <h2>Rekomendasi Untukmu</h2>
        <a href="#" class="view-all">Lihat Semua <i class="fas fa-chevron-right"></i></a>
      </div>
      <div class="video-grid" id="video-grid"></div>
    </section>
  </main>

  <!-- Settings Modal -->
  <div id="settingsModal" class="modal hidden">
    <div class="modal-content" style="max-width: 500px; padding: 30px;">
      <h2 style="color: white; margin-bottom: 20px;">Pengaturan API</h2>
      <p style="color: #aaa; margin-bottom: 10px;">Status API Key:</p>
      <div id="apiKeyStatus" style="margin-bottom: 20px;"></div>

      <div style="margin-bottom: 20px;">
        <label style="color: white; display: block; margin-bottom: 8px;">Custom API Key (Ferdev)</label>
        <input type="text" id="apiKeyInput" placeholder="Masukkan API Key..." style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #444; background: #222; color: white;">
      </div>

      <div style="display: flex; gap: 10px;">
        <button onclick="saveSettings()" style="flex: 1; padding: 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">Simpan Key</button>
        <button id="resetKeyBtn" onclick="resetSettings()" class="hidden" style="flex: 1; padding: 10px; background: #444; color: white; border: none; border-radius: 4px; cursor: pointer;">Reset ke Default</button>
        <button onclick="closeSettings()" style="flex: 1; padding: 10px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">Batal</button>
      </div>
    </div>
  </div>

  <footer>
    <div class="footer-content">
      <div class="logo"><span class="vip">VIP</span>DRACINA</div>
      <p>Tonton drama premium dan eksklusif dengan kualitas terbaik.</p>
      <div class="social-links">
        <a href="#"><i class="fab fa-facebook"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fab fa-instagram"></i></a>
      </div>
    </div>
    <div class="footer-bottom">&copy; 2024 VIPDRACINA. All rights reserved.</div>
  </footer>

  <script>
    const ACTIVE_API_KEY = '${API_KEY_VAL}';

    // Settings logic
    async function openSettings() {
        document.getElementById('settingsModal').classList.add('active');
        document.getElementById('settingsModal').classList.remove('hidden');
        try {
            const res = await fetch('/api/settings');
            const data = await res.json();
            const statusEl = document.getElementById('apiKeyStatus');
            if (data.configured) {
                 statusEl.innerHTML = '<span style="color: #4CAF50;"><i class="fas fa-check-circle"></i> Custom Key Active</span>';
                 document.getElementById('resetKeyBtn').classList.remove('hidden');
            } else {
                 statusEl.innerHTML = '<span style="color: #aaa;"><i class="fas fa-info-circle"></i> Using Default Key</span>';
                 document.getElementById('resetKeyBtn').classList.add('hidden');
            }
        } catch(e) {
            console.error(e);
        }
    }

    function closeSettings() {
        document.getElementById('settingsModal').classList.remove('active');
        document.getElementById('settingsModal').classList.add('hidden');
    }

    async function saveSettings() {
        const key = document.getElementById('apiKeyInput').value;
        if(!key) return alert('API Key tidak boleh kosong');

        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: key.trim() })
            });
            const data = await res.json();
            if(data.success) {
                alert('API Key berhasil disimpan!');
                closeSettings();
                window.location.reload();
            } else {
                alert('Gagal menyimpan: ' + (data.message || 'Error unknown'));
            }
        } catch (e) {
            alert('Gagal menyimpan: ' + e.message);
        }
    }

    async function resetSettings() {
        if(!confirm('Kembali ke Default Key?')) return;
        try {
            const res = await fetch('/api/settings', { method: 'DELETE' });
            const data = await res.json();
            if(data.success) {
                alert('API Key direset ke Default!');
                closeSettings();
                window.location.reload();
            } else {
                alert('Gagal reset: ' + (data.message || 'Error unknown'));
            }
        } catch (e) {
            alert('Gagal reset: ' + e.message);
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
      const heroSection = document.getElementById('hero-section');
      const videoGrid = document.getElementById('video-grid');

      const modal = document.createElement('div');
      modal.className = 'modal';
      modal.innerHTML = \`
        <div class="modal-content" style="max-height: 90vh; overflow-y: auto;">
          <button class="close-modal"><i class="fas fa-times"></i></button>

          <div id="player-container" class="hidden" style="width: 100%; aspect-ratio: 16/9; background: #000; position: relative;">
              <video id="videoPlayer" controls style="width: 100%; height: 100%;"></video>
              <div id="playerLoading" class="hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white;"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
              <div id="playerError" class="hidden" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: red;">Error playing video.</div>
          </div>

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
      \`;
      document.body.appendChild(modal);

      const closeModalBtn = modal.querySelector('.close-modal');
      const videoPlayer = document.getElementById('videoPlayer');

      closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        videoPlayer.pause();
        videoPlayer.src = '';
        document.getElementById('player-container').classList.add('hidden');
      });

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
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
      }

      // Robust fetch similar to apkmod
      async function robustFetch(directUrl, proxyUrl) {
          try {
              const res = await fetch(directUrl);
              if(res.ok) {
                 const text = await res.text();
                 try { return JSON.parse(text); } catch(e) { throw new Error('Direct parse error'); }
              }
              throw new Error('Direct fetch failed with ' + res.status);
          } catch(e) {
              console.warn('Direct fetch failed, trying proxy...', e);
              const res2 = await fetch(proxyUrl);
              const text2 = await res2.text();
              try {
                  const data2 = JSON.parse(text2);
                  return data2;
              } catch(e2) {
                  throw new Error('Proxy parse error');
              }
          }
      }

      async function fetchDramas() {
        try {
          const directUrl = \`https://api.ferdev.my.id/internet/melolo/search?query=CEO&apikey=\${ACTIVE_API_KEY}\`;
          const proxyUrl = \`/api/drakor?query=CEO\`;

          const data = await robustFetch(directUrl, proxyUrl);
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
            <img src="\${escapeHTML(drama.cover)}" alt="\${escapeHTML(drama.title)}">
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
            <img class="video-thumbnail" src="\${escapeHTML(drama.cover)}" alt="\${escapeHTML(drama.title)}">
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
              const directUrl = \`https://api.ferdev.my.id/internet/melolo/detail?bookId=\${item.book_id}&apikey=\${ACTIVE_API_KEY}\`;
              const proxyUrl = \`/api/detail?bookId=\${item.book_id}\`;
              const data = await robustFetch(directUrl, proxyUrl);

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
              const directUrl = \`https://api.ferdev.my.id/internet/melolo/stream?videoId=\${chapter.video_id}&apikey=\${ACTIVE_API_KEY}\`;
              const proxyUrl = \`/api/stream?videoId=\${chapter.video_id}\`;
              const data = await robustFetch(directUrl, proxyUrl);

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
