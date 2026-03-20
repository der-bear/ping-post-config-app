import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// Route definitions — slugs must match src/config/routes.ts
const FEATURE_PATHS = [
  { slug: 'ping-post', html: 'ping-post-config-app.html' },
  { slug: 'campaign-configuration', html: 'campaign-configuration.html' },
]

export default defineConfig({
  base: '/ping-post-config-app/',
  plugins: [
    react(),
    tailwindcss(),
    // Rewrite prototype paths to their HTML entry points in dev
    {
      name: 'mpa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, _res, next) => {
          const match = FEATURE_PATHS.find((f) => req.url?.includes(f.slug))
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
