import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// GHPAGES is set only by the GitHub Pages deploy workflow: Pages serves the
// site under /<repo-name>/, while Vercel (and local dev) serve from the root.
export default defineConfig({
  base: process.env.GHPAGES ? '/unidroit-legislative-implementation-website/' : '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})
