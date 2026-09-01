import tutorialkit from '@tutorialkit/astro';
import { defineConfig } from 'astro/config';

export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    tutorialkit({
      expressiveCodeThemes: ['github-light', 'github-dark'],
    }),
  ],
  site: 'https://reactquest.lastry.fr',
});
