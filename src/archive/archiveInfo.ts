/*
 * ARCHIVE SETTINGS — optional. The archive works without editing this file.
 *
 * Photos come from folders: src/archive/photos/<category>/<image>.jpg
 * Assign multiple tags per photo in captions below. New tags become filters automatically.
 */

/** Chip order. Folders not listed here come after these, A to Z. */
export const categoryOrder: string[] = [
  'friends', 'me', 'sony-cybershot-dsc-wx80', 'olympus-1030-sw',
  'nature', 'animals', 'landscape', 'architecture', 'city', 'food', 'football',
];

/** Nicer chip labels. A folder not listed here is shown as its name, e.g. "graphic-design" -> GRAPHIC DESIGN. */
export const categoryLabels: Record<string, string> = {
  'sony-cybershot-dsc-wx80': 'Sony Cybershot DSC-WX80',
  'olympus-1030-sw': 'Olympus 1030 SW',
};

/**
 * Optional captions, keyed by "<folder>/<file name>".
 * Use a plain string for just a caption, or an object to set title, date, and tags.
 * Tags use the keys above; new keys automatically add filters.
 * An explicit tags array overrides the folder tag; [] leaves a photo untagged.
 * Grid previews are cropped to 4:3 automatically (portrait photos included); the viewer shows the full image.
 * previewRatio overrides that crop for one photo (e.g. '1/1');
 * previewFocus picks which part stays in frame ('50% 65%' = centre, a bit below middle).
 *
 *   'photography/drillfield-sunset.jpg': 'First week on campus.',
 *   'photography/friends.jpg': { tags: ['friends', 'me', 'sony-cybershot-dsc-wx80'] },
 */
export const captions: Record<string, string | { title?: string; caption?: string; date?: string; tags?: string[]; previewRatio?: string; previewFocus?: string }> = {
  'nature/IMG_5688.JPG': { tags: ['me', 'nature', 'olympus-1030-sw'] },
  'nature/P7151262.JPG': { tags: ['olympus-1030-sw', 'friends', 'nature'] },
  'nature/P7151262(1).JPG': { tags: ['olympus-1030-sw', 'friends', 'nature'] },
  'architecture/P7151229(1).JPG': { tags: ['olympus-1030-sw', 'architecture'] },
  'architecture/P7151229.JPG': { tags: ['olympus-1030-sw', 'architecture'] },
  'architecture/P7151228.JPG': { tags: ['olympus-1030-sw', 'architecture'] },
  'nature/P7151231.JPG': { tags: ['nature', 'olympus-1030-sw'] },
  'nature/P7151254.JPG': { tags: ['nature', 'animals', 'olympus-1030-sw'] },
  'nature/P7151276.JPG': { tags: ['nature', 'olympus-1030-sw'] },
  'nature/P7151277.JPG': { tags: ['nature', 'olympus-1030-sw'] },
  'nature/P7151278.JPG': { tags: ['nature', 'olympus-1030-sw'] },
  'nature/DSC00769.jpg': { tags: ['sony-cybershot-dsc-wx80', 'animals', 'nature'], previewFocus: '50% 62%' },
  'nature/DSC00770.jpg': { tags: ['sony-cybershot-dsc-wx80', 'animals', 'nature'], previewFocus: '50% 58%' },
  'city/569ED856-ADB4-4855-8077-59803D34AE92.jpg': { tags: ['friends', 'city', 'sony-cybershot-dsc-wx80'], title: '' },
  'city/DD9A112F-BE4A-400D-83DF-034973503E7E.jpg': { tags: ['city', 'architecture', 'sony-cybershot-dsc-wx80'], title: '' },
  'city/DSC00390.JPG': { tags: ['friends', 'city', 'architecture', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00393.JPG': { tags: ['city', 'nature', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00407.JPG': { tags: ['friends', 'city', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00426.JPG': { tags: ['friends', 'city', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00636.JPG': { tags: ['city', 'architecture', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00646.JPG': { tags: ['city', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00671.JPG': { tags: ['city', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00677.JPG': { tags: ['city', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00682.JPG': { tags: ['city', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00460.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00624.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00692.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00693.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00694.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00696.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00860.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 78%' },
  'nature/DSC00571.JPG': { tags: ['nature', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00572.JPG': { tags: ['nature', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00574.JPG': { tags: ['nature', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00576.JPG': { tags: ['nature', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00591.JPG': { tags: ['nature', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00665.JPG': { tags: ['nature', 'sony-cybershot-dsc-wx80'] },
  'architecture/DSC00709.JPG': { tags: ['architecture', 'sony-cybershot-dsc-wx80'] },
  'architecture/DSC00749.JPG': { tags: ['architecture', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'architecture/DSC01007.JPG': { tags: ['architecture', 'friends', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 70%' },
  'city/DSC00394.JPG': { tags: ['city', 'architecture', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00399.JPG': { tags: ['city', 'architecture', 'sony-cybershot-dsc-wx80'] },
  'city/DSC00440.JPG': { tags: ['friends', 'city', 'sony-cybershot-dsc-wx80'] },
  'food/DSC00691.JPG': { tags: ['food', 'sony-cybershot-dsc-wx80'] },
  'architecture/DSC00711.JPG': { tags: ['architecture', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 45%' },
  'nature/DSC00765.JPG': { tags: ['nature', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 72%' },
  'architecture/DSC00810.JPG': { tags: ['friends', 'architecture', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 62%' },
  'friends/DSC00842.JPG': { tags: ['friends', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00760.JPG': { tags: ['nature', 'sony-cybershot-dsc-wx80'] },
  'architecture/DSC00764.JPG': { tags: ['architecture', 'nature', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 55%' },
  'architecture/DSC00715.JPG': { tags: ['architecture', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 40%' },
  'architecture/DSC00716.JPG': { tags: ['architecture', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 45%' },
  'architecture/DSC00746.JPG': { tags: ['architecture', 'landscape', 'sony-cybershot-dsc-wx80'] },
  'nature/DSC00789.JPG': { tags: ['nature', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 35%' },
  'football/DSC00947.JPG': { tags: ['football', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 70%' },
  'football/DSC00958.JPG': { tags: ['football', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 72%' },
  'football/DSC00969.JPG': { tags: ['football', 'sony-cybershot-dsc-wx80'], previewFocus: '50% 70%' },
};
