import { getAssetFromKV } from '@cloudflare/kv-asset-handler';
import manifestJSON from '__STATIC_CONTENT_MANIFEST';

const assetManifest = JSON.parse(manifestJSON);

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Proxy the random API to avoid CORS issues
    if (url.pathname === '/api/random') {
      try {
        const response = await fetch('https://magma-api.biz.id/dramabox/random', {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          }
        });

        // Use arrayBuffer to pass the response through exactly as it is, to avoid JSON parsing issues on large/chunked responses
        const data = await response.arrayBuffer();

        return new Response(data, {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to fetch data' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
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