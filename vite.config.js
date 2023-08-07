import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const VITE_BASE = process.env.VITE_BASE || '/';

// https://vitejs.dev/config/
export default defineConfig({
  base: VITE_BASE,
  plugins: [react()],
})
