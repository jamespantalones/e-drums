import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config';

const background = '#000000';

export default defineConfig({
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, resizeOptions: { background } },
    apple: { ...minimal2023Preset.apple, resizeOptions: { background } },
  },
  images: ['public/icons/logo.svg'],
});
