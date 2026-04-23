import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const backend = 'https://localhost:7227'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl()],
  server: {
    port: 48971,
    host: 'localhost',
    strictPort: true,
    https: {},
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
          secure: false,
          xfwd: true,
        },
      ]),
    ),
  },
})
