import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A GitHub Pages a repo nevu almappabol szolgalja ki az oldalt:
//   https://FELHASZNALONEVED.github.io/REPO-NEV/
// Ezert a "base" erteket a repo nevere kell allitani.
// Ezt a VITE_BASE kornyezeti valtozoval lehet beallitani (a GitHub Actions ezt megteszi),
// helyben pedig "/" az alapertelmezett.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
});
