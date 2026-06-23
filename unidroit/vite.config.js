import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// GHPAGES is set only by the GitHub Pages deploy workflow: Pages serves the
// site under /<repo-name>/, while Vercel (and local dev) serve from the root.
export default defineConfig({
  base: process.env.GHPAGES ? '/unidroit-legislative-implementation-website/' : '/',
  // plotly.js references the Node-only `global`; map it to the browser's
  // globalThis so it loads in the browser without a ReferenceError.
  define: {
    global: 'globalThis',
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
})
