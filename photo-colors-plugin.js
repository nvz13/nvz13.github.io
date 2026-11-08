// Vite plugin: reads every photo in src/archive/photos/ and works out its main colour,
// so the archive grid can be ordered by colour. Runs automatically in `npm run dev`
// and `npm run build`; new uploads are picked up without any extra step.
//
// Exposes `virtual:photo-colors`: { "<folder>/<file>": [hue 0-360, saturation 0-1, lightness 0-1] }
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const VIRTUAL_ID = 'virtual:photo-colors';
const RESOLVED_ID = '\0' + VIRTUAL_ID;
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [Math.round(h * 60), +s.toFixed(3), +l.toFixed(3)];
}

// Average colour of a small thumbnail, weighted towards saturated pixels so a
// red restaurant or a green lawn wins over grey pavement and white sky.
async function colourOf(file) {
  const { data, info } = await sharp(file, { failOn: 'none' })
    .rotate()
    .resize(48, 48, { fit: 'inside' })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let r = 0;
  let g = 0;
  let b = 0;
  let wsum = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const pr = data[i];
    const pg = data[i + 1];
    const pb = data[i + 2];
    const max = Math.max(pr, pg, pb);
    const min = Math.min(pr, pg, pb);
    const w = 0.15 + (max - min) / 255; // more saturated pixels count more
    r += pr * w;
    g += pg * w;
    b += pb * w;
    wsum += w;
  }
  return rgbToHsl(r / wsum, g / wsum, b / wsum);
}

async function walk(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(full)));
    else if (IMAGE.test(e.name)) out.push(full);
  }
  return out;
}

export function photoColors() {
  let photosDir = '';
  const cache = new Map(); // absolute path -> { mtime, hsl }

  const compute = async () => {
    const files = await walk(photosDir);
    const result = {};
    await Promise.all(
      files.map(async (file) => {
        try {
          const { mtimeMs } = await stat(file);
          let hit = cache.get(file);
          if (!hit || hit.mtime !== mtimeMs) {
            hit = { mtime: mtimeMs, hsl: await colourOf(file) };
            cache.set(file, hit);
          }
          result[path.relative(photosDir, file).split(path.sep).join('/')] = hit.hsl;
        } catch {
          // unreadable image: leave it out, it just sorts last
        }
      }),
    );
    return result;
  };

  return {
    name: 'photo-colors',
    configResolved(config) {
      photosDir = path.resolve(config.root, 'src/archive/photos');
    },
    resolveId(id) {
      return id === VIRTUAL_ID ? RESOLVED_ID : null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      return `export default ${JSON.stringify(await compute())};`;
    },
    configureServer(server) {
      const refresh = (file) => {
        if (!file.startsWith(photosDir) || !IMAGE.test(file)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: 'full-reload' });
      };
      server.watcher.on('add', refresh);
      server.watcher.on('change', refresh);
      server.watcher.on('unlink', refresh);
    },
  };
}
