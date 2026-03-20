import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Route definitions shared with src/config/routes.ts
const FEATURE_PATHS = [
  { path: '/ping-post-config-app', html: 'ping-post-config-app.html' },
  { path: '/campaign-configuration', html: 'campaign-configuration.html' },
]

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
    // Rewrite prototype paths to their HTML entry points in dev
    {
      name: 'mpa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const match = FEATURE_PATHS.find((f) => req.url?.startsWith(f.path))
          if (match) req.url = `/${match.html}`
          next()
        })
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          FEATURE_PATHS.map((f) => [
            f.html.replace('.html', ''),
            path.resolve(__dirname, f.html),
          ]),
        ),
      },
    },
  },
})
