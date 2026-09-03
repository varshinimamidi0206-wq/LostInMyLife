import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin, ViteDevServer } from 'vite';

function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0].replace('/api/', '');

        // Collect request body
        let bodyBuffer = '';
        req.on('data', chunk => {
          bodyBuffer += chunk;
        });

        req.on('end', async () => {
          try {
            let parsedBody = {};
            if (bodyBuffer) {
              try {
                parsedBody = JSON.parse(bodyBuffer);
              } catch {
                parsedBody = bodyBuffer;
              }
            }
            (req as any).body = parsedBody;

            // Express-like helpers for res
            (res as any).status = (statusCode: number) => {
              res.statusCode = statusCode;
              return {
                json: (data: any) => {
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify(data));
                }
              };
            };

            if (urlPath === 'analyze-memory') {
              const { default: handler } = await import('./api/analyze-memory');
              return handler(req, res);
            } else if (urlPath === 'ask-memory') {
              const { default: handler } = await import('./api/ask-memory');
              return handler(req, res);
            } else if (urlPath === 'find-similar') {
              const { default: handler } = await import('./api/find-similar');
              return handler(req, res);
            } else if (urlPath === 'search-memories') {
              const { default: handler } = await import('./api/search-memories');
              return handler(req, res);
            } else if (urlPath === 'save-memory') {
              const { default: handler } = await import('./api/save-memory');
              return handler(req, res);
            }

            res.statusCode = 404;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: `API route /api/${urlPath} not found` }));
          } catch (err: any) {
            console.error('Error handling API route in dev:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // Populate process.env for api routes during dev
  Object.assign(process.env, env);

  return {
    plugins: [react(), apiDevPlugin()],
    server: {
      port: 5173,
      host: true,
    }
  };
});
