// Screen canvases. Sizes keep the proportions of the model's display areas:
// inner 15.7987 × 11.1035 units, outer 7.73936 × 11.2513 units (1.5× the upstream 1600×1125 and 774×1125).
export const INNER = { width: 2400, height: 1688 };
export const OUTER = { width: 1161, height: 1688 };

export function makeCanvas({ width, height }) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

// Draw an image (or video frame) into a screen canvas. "cover" fills and crops, "contain" letterboxes on black.
export function drawFit(canvas, source, fit = 'cover', align = 'center') {
  const c = canvas.getContext('2d');
  const sw = source.naturalWidth || source.videoWidth || source.width;
  const sh = source.naturalHeight || source.videoHeight || source.height;
  c.fillStyle = '#000';
  c.fillRect(0, 0, canvas.width, canvas.height);
  const scale = (fit === 'contain' ? Math.min : Math.max)(canvas.width / sw, canvas.height / sh);
  const w = sw * scale, h = sh * scale;
  const x = align === 'right' ? canvas.width - w : align === 'left' ? 0 : (canvas.width - w) / 2;
  c.drawImage(source, x, (canvas.height - h) / 2, w, h);
}

// The built-in screens: a soft dusk gradient with a lock-screen clock. The cover shows the right-hand part of the
// same wallpaper, so the picture continues when the phone opens. All of it is drawn here; no third-party images.
export function defaultScreens({ time = '9:41', date = 'Monday, September 14', palette } = {}) {
  const colors = palette ?? ['#0d1230', '#3a1d6e', '#ff7a3d', '#ff4fa3', '#5b6cff', '#ffd36b'];
  const wallpaper = makeCanvas(INNER);
  const w = wallpaper.width, h = wallpaper.height;
  const c = wallpaper.getContext('2d');
  const base = c.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, colors[0]);
  base.addColorStop(1, colors[1]);
  c.fillStyle = base;
  c.fillRect(0, 0, w, h);
  c.filter = `blur(${Math.round(h * 0.06)}px)`;
  for (const [x, y, r, color, alpha] of [
    [0.82, 0.86, 0.62, colors[2], 0.95],
    [0.58, 0.42, 0.42, colors[3], 0.7],
    [0.18, 0.16, 0.5, colors[4], 0.75],
    [0.98, 0.06, 0.36, colors[5], 0.55],
    [0.32, 0.92, 0.38, colors[3], 0.35],
  ]) {
    const g = c.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * h);
    g.addColorStop(0, hexAlpha(color, alpha));
    g.addColorStop(1, hexAlpha(color, 0));
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }
  c.filter = 'none';
  grain(c, w, h, 7);

  const inner = makeCanvas(INNER);
  const outer = makeCanvas(OUTER);
  inner.getContext('2d').drawImage(wallpaper, 0, 0);
  outer.getContext('2d').drawImage(wallpaper, outer.width - w, 0);
  // Same clock on both: centred on the cover, and on the matching right-hand part of the inner screen.
  lockClock(outer.getContext('2d'), outer.width / 2, outer.height, time, date);
  lockClock(inner.getContext('2d'), w - outer.width / 2, h, time, date);
  return { inner, outer };
}

function lockClock(c, cx, h, time, date) {
  c.save();
  c.textAlign = 'center';
  c.textBaseline = 'alphabetic';
  c.fillStyle = 'rgba(255,255,255,0.86)';
  c.font = `600 ${Math.round(h * 0.036)}px -apple-system, "SF Pro Display", Inter, system-ui, sans-serif`;
  c.fillText(date, cx, h * 0.135);
  c.fillStyle = 'rgba(255,255,255,0.94)';
  c.font = `700 ${Math.round(h * 0.17)}px -apple-system, "SF Pro Rounded", "SF Pro Display", Inter, system-ui, sans-serif`;
  c.fillText(time, cx, h * 0.3);
  c.restore();
}

function grain(c, w, h, amount) {
  const image = c.getImageData(0, 0, w, h);
  let seed = 1234567;
  for (let i = 0; i < image.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    const n = ((seed >>> 16) / 65535 - 0.5) * amount;
    image.data[i] += n;
    image.data[i + 1] += n;
    image.data[i + 2] += n;
  }
  c.putImageData(image, 0, 0);
}

function hexAlpha(hex, alpha) {
  const v = parseInt(hex.slice(1), 16);
  return `rgba(${v >> 16}, ${(v >> 8) & 255}, ${v & 255}, ${alpha})`;
}
