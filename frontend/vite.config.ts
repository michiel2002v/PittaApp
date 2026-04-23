import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const backend = 'http://localhost:7227'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 48971,
    host: 'localhost',
    strictPort: true,
    proxy: Object.fromEntries(
      [
        '/signin-oidc',
        '/signout-callback-oidc',
        '/MicrosoftIdentity',
        '/me',
        '/admin',
        '/orders',
        '/order-rounds',
        '/menu',
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
