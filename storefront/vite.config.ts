import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ローカル実行専用のモックアップ。外部 API には接続しない（NFR-1）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
