import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    host: true,
    port: 5174,
    strictPort: true,

    allowedHosts: [
      'wonbills.com',
      'www.wonbills.com',
      'test.wonbills.com',
      'dev.wonbills.com'
    ]
  },

  optimizeDeps: {
    force: true,
  }
})