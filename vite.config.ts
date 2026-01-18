import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    proxy: {
      '/api/prod': {
        target: 'https://cloudcode-pa.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/prod/, ''),
        secure: false,
        headers: {
          'User-Agent': 'antigravity/1.11.5 windows/amd64',
          'X-Goog-Api-Client': 'google-cloud-sdk vscode_cloudshelleditor/0.1',
        }
      },
      '/api/daily': {
        target: 'https://daily-cloudcode-pa.sandbox.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/daily/, ''),
        secure: false,
        headers: {
          'User-Agent': 'antigravity/1.11.5 windows/amd64',
          'X-Goog-Api-Client': 'google-cloud-sdk vscode_cloudshelleditor/0.1',
        }
      },
      '/api/autopush': {
        target: 'https://autopush-cloudcode-pa.sandbox.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/autopush/, ''),
        secure: false,
        headers: {
          'User-Agent': 'antigravity/1.11.5 windows/amd64',
          'X-Goog-Api-Client': 'google-cloud-sdk vscode_cloudshelleditor/0.1',
        }
      },
    },
  },
});
