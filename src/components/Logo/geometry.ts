import { glyph } from './bitmap';

/** Each LED fills most of its cell, leaving a visible grid gap */
export const PIXEL = { inset: 0.08, size: 0.84 } as const;

/**
 * Logo mark: the pixel "E" on the LED grid, in a 100x100 viewBox.
 * Shared by the React component and the icon generator script.
 */
export function markPixels(cell = 9) {
  const { pixels, width, height } = glyph('E');
  const ox = 50 - (width * cell) / 2;
  const oy = 50 - (height * cell) / 2;
  return pixels.map(({ x, y }) => ({
    x: ox + (x + PIXEL.inset) * cell,
    y: oy + (y + PIXEL.inset) * cell,
    size: PIXEL.size * cell,
  }));
}

export function markSvg(ink = '#fff', paper = '#000') {
  const rects = markPixels()
    .map((p) => `<rect x="${p.x}" y="${p.y}" width="${p.size}" height="${p.size}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" fill="${paper}"/><g fill="${ink}">${rects}</g></svg>\n`;
}
