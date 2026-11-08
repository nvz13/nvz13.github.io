import { categoryLabels, categoryOrder, captions } from '../archive/archiveInfo';
import { photography } from './portfolioData';
import photoColors from 'virtual:photo-colors';

export type ArchivePhoto = {
  id: string;
  /** Image URL. Empty for the generated placeholder plates. */
  src: string;
  title: string;
  caption: string;
  date: string;
  tags: string[];
  /** Optional grid-preview crop, e.g. "4/3". The full image in the viewer is never cropped. */
  previewRatio?: string;
  /** Which part of the photo stays in the preview crop (CSS object-position), e.g. "50% 65%". */
  previewFocus?: string;
  categoryKey: string;
  category: string;
  /** Only used by placeholders. */
  palette?: [string, string, string];
  seed?: number;
  ratio?: 'tall' | 'wide' | 'square';
};

export type ArchiveCategory = { key: string; label: string; count: number };

// Every image inside src/archive/photos/<category>/ is picked up at build time.
// Images get hashed URLs; the browser only downloads them when they scroll into view.
const files = import.meta.glob<string>(
  '../archive/photos/**/*.{jpg,jpeg,png,webp,avif,gif,JPG,JPEG,PNG,WEBP,AVIF,GIF}',
  { eager: true, import: 'default' },
);

const CAMERA_NAME = /^(img|dsc|dscn|dscf|pxl|mvimg|photo|image|screenshot|screen shot|untitled)[\s_-]*\d/i;
const DATE_PREFIX = /^(\d{4}(?:[-_.]\d{2}){0,2})(?:[\s_-]+|$)/;

const prettyLabel = (key: string) => categoryLabels[key] ?? key.replace(/[-_]+/g, ' ');

function fromFileName(name: string) {
  let stem = name.replace(/\.[^.]+$/, '');
  let date = '';
  const dated = stem.match(DATE_PREFIX);
  if (dated) {
    date = dated[1].replace(/[_.]/g, '-');
    stem = stem.slice(dated[0].length);
  }
  // Drop a leading sort number such as "01-" or "07_".
  stem = stem.replace(/^\d{1,3}[\s_-]+/, '');
  const title = CAMERA_NAME.test(stem) || !stem ? '' : stem.replace(/[-_]+/g, ' ').trim();
  return { title, date };
}

const rank = (key: string) => {
  const index = categoryOrder.indexOf(key);
  return index === -1 ? categoryOrder.length : index;
};

// Photos are ordered by colour so the grid flows like a gradient: colourful photos
// run through the hues (warm reds and oranges, then yellows, greens, blues, purples),
// and greyish / muted photos are grouped at the end from light to dark.
// The colours are measured from the images automatically (see photo-colors-plugin.js).
const HUE_START = 340; // start the wheel at deep pink/red so reds aren't split across both ends
function colorKey(id: string) {
  const c = photoColors[id];
  if (!c) return 10_000;
  const [h, s, l] = c;
  if (s < 0.12 || l < 0.12 || l > 0.9) return 1_000 + (1 - l) * 100; // neutrals, light → dark
  const hue = (h - HUE_START + 360) % 360;
  return Math.floor(hue / 12) * 2 + (1 - l); // bucket by hue, lighter first within a bucket
}

const realPhotos: ArchivePhoto[] = Object.entries(files)
  .map(([path, src]) => {
    const relative = path.replace('../archive/photos/', '');
    const parts = relative.split('/');
    const fileName = parts[parts.length - 1];
    const categoryKey = parts.length > 1 ? parts[0] : 'misc';
    const parsed = fromFileName(fileName);
    const extra = captions[relative];
    const info = typeof extra === 'string' ? { caption: extra } : extra ?? {};
    return {
      id: relative,
      src,
      title: info.title ?? parsed.title,
      caption: info.caption ?? '',
      date: info.date ?? parsed.date,
      tags: [...new Set(info.tags ?? (categoryOrder.includes(categoryKey) ? [categoryKey] : []))],
      previewRatio: info.previewRatio,
      previewFocus: info.previewFocus,
      categoryKey,
      category: prettyLabel(categoryKey),
    };
  })
  .sort((a, b) => colorKey(a.id) - colorKey(b.id) || a.id.localeCompare(b.id, undefined, { numeric: true }));

/** True once at least one real image is in the photos folder. */
export const hasRealPhotos = realPhotos.length > 0;

// Until real photos exist, the archive shows the generated placeholder plates.
export const archivePhotos: ArchivePhoto[] = hasRealPhotos
  ? realPhotos
  : photography.map((plate) => ({
      id: plate.id,
      src: plate.imageRef,
      title: plate.title,
      caption: plate.description,
      date: plate.date,
      tags: [],
      categoryKey: plate.category.toLowerCase(),
      category: plate.category,
      palette: plate.palette,
      seed: plate.seed,
      ratio: plate.ratio,
    }));

// Keep configured tags visible before uploads; discover additional tags automatically.
export const archiveCategories: ArchiveCategory[] = [
  ...new Set([...categoryOrder, ...archivePhotos.flatMap((photo) => photo.tags)]),
]
  .sort((a, b) => rank(a) - rank(b) || a.localeCompare(b))
  .map((key) => ({
    key,
    label: prettyLabel(key),
    count: archivePhotos.filter((photo) => photo.tags.includes(key)).length,
  }));
