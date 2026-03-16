import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // API Route for ferdev API
    if (url.pathname.startsWith('/api/')) {
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        };

        try {
            let apiUrl = '';
            if (url.pathname === '/api/drakor') {
                const query = url.searchParams.get('query') || 'CEO';
                apiUrl = `https://api.ferdev.my.id/internet/melolo/search?query=${query}&apikey=dedi131`;
            } else if (url.pathname === '/api/detail') {
                const bookId = url.searchParams.get('bookId');
                apiUrl = `https://api.ferdev.my.id/internet/melolo/detail?bookId=${bookId}&apikey=dedi131`;
            } else if (url.pathname === '/api/stream') {
                const videoId = url.searchParams.get('videoId');
                apiUrl = `https://api.ferdev.my.id/internet/melolo/stream?videoId=${videoId}&apikey=dedi131`;
            } else {
                return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404, headers: corsHeaders });
            }

            const response = await fetch(apiUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                }
            });

            const data = await response.arrayBuffer();
            return new Response(data, { headers: corsHeaders });

        } catch (error) {
            return new Response(JSON.stringify({ error: 'Failed to fetch data' }), { status: 500, headers: corsHeaders });
        }
    }

    // Serve static assets from the public directory
    try {
      let page = await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: assetManifest,
        }
      );

      const res = new Response(page.body, page)

      // Explicitly set content types for main files if missing
      if (url.pathname.endsWith('.css')) {
          res.headers.set('Content-Type', 'text/css');
      } else if (url.pathname.endsWith('.js')) {
          res.headers.set('Content-Type', 'application/javascript');
      } else if (url.pathname === '/' || url.pathname.endsWith('.html')) {
          res.headers.set('Content-Type', 'text/html;charset=UTF-8');
      }

      return res;

    } catch (e) {
      // Fallback to index.html for SPA routing or errors
      try {
        let notFoundResponse = await getAssetFromKV(
          {
            request: new Request(`${new URL(request.url).origin}/index.html`, request),
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.__STATIC_CONTENT,
            ASSET_MANIFEST: assetManifest,
          }
        );

        return new Response(notFoundResponse.body, {
          ...notFoundResponse,
          status: 200,
          headers: {
            'Content-Type': 'text/html;charset=UTF-8'
          }
        });
      } catch (e2) {
         return new Response("Not found", {status: 404});
      }
    }
  },
};
