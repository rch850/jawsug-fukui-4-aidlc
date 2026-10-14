import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ローカル実行専用のモックアップ。外部 API に接続するのは郵便番号からの住所の自動入力（zipcloud）だけ（NFR-1 の例外、CR-1）。
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
