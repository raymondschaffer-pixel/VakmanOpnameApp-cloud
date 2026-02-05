
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || ""),
    'process.env.FB_API_KEY': JSON.stringify(process.env.FB_API_KEY || ""),
    'process.env.FB_AUTH_DOMAIN': JSON.stringify(process.env.FB_AUTH_DOMAIN || ""),
    'process.env.FB_PROJECT_ID': JSON.stringify(process.env.FB_PROJECT_ID || ""),
    'process.env.FB_STORAGE_BUCKET': JSON.stringify(process.env.FB_STORAGE_BUCKET || ""),
    'process.env.FB_MESSAGING_SENDER_ID': JSON.stringify(process.env.FB_MESSAGING_SENDER_ID || ""),
    'process.env.FB_APP_ID': JSON.stringify(process.env.FB_APP_ID || "")
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage']
        }
      }
    }
  }
});
