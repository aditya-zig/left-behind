import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import deployment from './vercel.json';
// Exercise the same security policy in local production-browser checks.
const headers = Object.fromEntries(deployment.headers[0].headers.map(({ key, value }) => [key, value]));
export default defineConfig({ plugins: [react()], preview: { headers }, build: { rollupOptions: { output: { manualChunks: { three: ['three'], react: ['react', 'react-dom'] } } } } });
