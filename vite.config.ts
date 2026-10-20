import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function adminApiDevPlugin(): Plugin {
  const handlerMiddleware = async (req: any, res: any) => {
    // 1. Set CORS headers immediately
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      return res.end();
    }

    const executeHandler = async (rawBody: string) => {
      try {
        if (rawBody && !req.body) {
          try {
            req.body = JSON.parse(rawBody);
          } catch {
            req.body = rawBody;
          }
        }
        const { default: handler } = await import('./api/admin-users.ts');
        await handler(req, res);
      } catch (e: any) {
        console.error('Erro no handler admin-users:', e);
        if (!res.writableEnded) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: e.message || 'Erro interno no servidor' }));
        }
      }
    };

    if (req.body !== undefined || req.readableEnded) {
      return executeHandler(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));
    }

    let body = '';
    let finished = false;

    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        executeHandler(body);
      }
    }, 2000);

    req.on('data', (chunk: any) => {
      body += chunk;
    });

    req.on('end', () => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        executeHandler(body);
      }
    });

    req.on('error', (err: any) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        console.error('Erro no stream da requisição admin-users:', err);
        executeHandler(body);
      }
    });
  };

  return {
    name: 'admin-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use('/api/admin-users', handlerMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/admin-users', handlerMiddleware);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), adminApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
