import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    tutorialkit({
      components: {
        TopBar: './src/components/QuestTopBar.astro',
      },
      defaultRoutes: 'tutorial-only',
      expressiveCodeThemes: ['github-light', 'github-dark'],
    }),
  ],
  site: 'https://reactquest.lastry.fr',
  vite: {
    preview: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
    server: {
      headers: {
        'Cross-Origin-Embedder-Policy': 'require-corp',
        'Cross-Origin-Opener-Policy': 'same-origin',
      },
    },
  },
});
