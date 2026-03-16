const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

// Mock data for the ferdev API
const mockSearchData = {
    success: true,
    result: [
        {
            book_id: "123",
            title: "CEO Mock Drama",
            cover: "https://via.placeholder.com/400x600/FF0000/FFFFFF?text=CEO+Drama",
            sinopsis: "This is a mock CEO drama.",
            status: "Completed",
            total_chapters: 10
        },
        {
            book_id: "124",
            title: "Romance Mock Drama",
            cover: "https://via.placeholder.com/400x600/00FF00/FFFFFF?text=Romance",
            sinopsis: "This is a mock romance drama.",
            status: "Ongoing",
            total_chapters: 5
        }
    ]
};

const mockDetailData = {
    success: true,
    result: {
        episodes: [
            { chapter_num: 1, video_id: "vid1", cover: "https://via.placeholder.com/800x450/0000FF/FFFFFF?text=Ep+1" },
            { chapter_num: 2, video_id: "vid2", cover: "https://via.placeholder.com/800x450/0000FF/FFFFFF?text=Ep+2" }
        ]
    }
};

const mockStreamData = {
    success: true,
    result: {
        video_url: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
};

const server = http.createServer((req, res) => {
    // API Routes
    if (req.url.startsWith('/api/drakor')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockSearchData));
        return;
    }
    if (req.url.startsWith('/api/detail')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockDetailData));
        return;
    }
    if (req.url.startsWith('/api/stream')) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockStreamData));
        return;
    }

    // Static files
    let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
    const extname = String(path.extname(filePath)).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
    };

    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if(error.code == 'ENOENT'){
                res.writeHead(404);
                res.end('Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + error.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`Mock server running at http://localhost:${PORT}/`);
});
