// FIX: The reference to "node" types was causing a build error.
// Replaced `process.cwd()` with an explicit import of `cwd` from `node:process`
// to resolve TypeScript errors without relying on global node types.
import { cwd } from 'node:process';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env': env,
    },
  };
});
