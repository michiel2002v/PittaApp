import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:5080'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: true,
    proxy: Object.fromEntries(
      [
        '/signin-oidc',
        '/signout-callback-oidc',
        '/MicrosoftIdentity',
        '/me',
        '/admin',
        '/health',
      ].map((path) => [
        path,
        {
          target: backend,
          changeOrigin: false,
          xfwd: true,
        },
      ]),
    ),
  },
})
