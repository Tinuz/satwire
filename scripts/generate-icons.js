// scripts/generate-icons.js
// Generates PWA icons: 192x192 and 512x512 PNG
// Design: dark background (#0A0A0A) with "SW" monogram in neon green (#22C55E)
// Run: node scripts/generate-icons.js

const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

const BG  = { r: 10,  g: 10,  b: 10,  a: 255 }; // #0A0A0A
const FG  = { r: 34,  g: 197, b: 94,  a: 255 }; // #22C55E

function generateIcon(size) {
  const png = new PNG({ width: size, height: size });

  // Fill background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) * 4;
      png.data[idx]     = BG.r;
      png.data[idx + 1] = BG.g;
      png.data[idx + 2] = BG.b;
      png.data[idx + 3] = BG.a;
    }
  }

  // Draw a rounded rect border in green (accent ring)
  const border = Math.round(size * 0.04);
  const radius = Math.round(size * 0.18);

  function setPixel(x, y, color) {
    if (x < 0 || y < 0 || x >= size || y >= size) return;
    const idx = (size * y + x) * 4;
    png.data[idx]     = color.r;
    png.data[idx + 1] = color.g;
    png.data[idx + 2] = color.b;
    png.data[idx + 3] = color.a;
  }

  // Draw "S" and "W" as simple pixel blocks (bitmap font style)
  // Scale factor
  const scale = Math.round(size / 64);

  // Pixel-art "S" glyph (7x9 grid)
  const S = [
    [0,1,1,1,1,0],
    [1,0,0,0,0,1],
    [1,0,0,0,0,0],
    [0,1,1,1,1,0],
    [0,0,0,0,0,1],
    [0,0,0,0,0,1],
    [1,0,0,0,0,1],
    [0,1,1,1,1,0],
  ];

  // Pixel-art "W" glyph (7x9 grid)
  const W = [
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
    [1,0,0,1,0,0,1],
    [1,0,1,0,1,0,1],
    [1,0,1,0,1,0,1],
    [1,1,0,0,0,1,1],
    [1,0,0,0,0,0,1],
    [1,0,0,0,0,0,1],
  ];

  const glyphH = S.length;
  const sW = S[0].length;
  const wW = W[0].length;
  const gap = scale * 2;
  const totalW = (sW + wW) * scale + gap;
  const totalH = glyphH * scale;

  const startX = Math.round((size - totalW) / 2);
  const startY = Math.round((size - totalH) / 2);

  // Draw S
  for (let row = 0; row < S.length; row++) {
    for (let col = 0; col < S[row].length; col++) {
      if (S[row][col]) {
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            setPixel(startX + col * scale + dx, startY + row * scale + dy, FG);
          }
        }
      }
    }
  }

  // Draw W
  const wStartX = startX + sW * scale + gap;
  for (let row = 0; row < W.length; row++) {
    for (let col = 0; col < W[row].length; col++) {
      if (W[row][col]) {
        for (let dy = 0; dy < scale; dy++) {
          for (let dx = 0; dx < scale; dx++) {
            setPixel(wStartX + col * scale + dx, startY + row * scale + dy, FG);
          }
        }
      }
    }
  }

  return png;
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const size of [192, 512]) {
  const png  = generateIcon(size);
  const buf  = PNG.sync.write(png);
  const file = path.join(outDir, `icon-${size}x${size}.png`);
  fs.writeFileSync(file, buf);
  console.log(`✓ Created ${file} (${buf.length} bytes)`);
}
