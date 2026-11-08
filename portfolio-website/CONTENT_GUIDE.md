# Portfolio content guide

Edit personal details and portfolio collections in
[`src/content/portfolioData.ts`](./src/content/portfolioData.ts). The page
components read from these exports; adding an item to a collection updates its
section automatically. Keep placeholder values clearly marked until you have
verified details to publish.

## Biography

In the `site` object, update `shortBio` for the homepage card and `longBio` for
the dossier profile. Update `name`, `role`, `brand`, or `mark` there if needed.
The current university and interests are already filled in from the supplied
information.

## Homepage tagline

Change `site.tagline`. The homepage keeps the same two-line title treatment by
breaking the tagline before its final word.

## Add a project

Add an object to `projects`. It appears on the Research page. Each item needs a
unique `id`, `title`, `category`, `date`, `description`, and `imageRef`. Use an
empty string for `imageRef` if there is no image; `externalLink` is optional.

```ts
{
  id: 'my-project',
  title: 'Project title',
  category: 'Category',
  date: '2026',
  description: 'A short, accurate description.',
  imageRef: '',
  externalLink: 'https://example.com',
}
```

## Add an activity

Add an entry to `activities` with an `id`, the organization (`org`) and your
`role`. `description`, `date` and `externalLink` are optional. Activities show
on the About page as "Organization — Role".

## Add a research experience

Add a standard content item to `researchExperiences`. It appears under
Education on the About page. Do not include unverified positions, dates, or
achievements.

## Upload a photo

Put the image file in `public/photos/`, then add a `photography` entry with its
`imageRef` set to `/photos/your-file.jpg`. Include a unique `id`, `title`,
`date`, and `description`, and set `category` to `FILM`, `DIGITAL`, or `MICRO`
to drive the existing filters. Also include the display fields `ratio`,
`palette`, and `seed`. `ratio`, `palette`, and `seed` only control the
existing artwork presentation. An empty `imageRef` shows the unchanged
procedural placeholder artwork.

## Add a blog post

Add a standard content item to `blogPosts`. It appears in the Writing tab of
the Archive page (see "Archive: blog" below).

## Add a skill

`skills` is a list of groups, each with a `group` label (for example "Tools")
and an `items` list of names. Add a name to a group's `items`, or add a new
group. The About page shows each group as a row of tags.

## Contact, social links, and resume

- Set `site.email` to your email address. Email buttons use it automatically.
- Replace the empty `href` values in `site.links` with your real social URLs.
  Add or remove entries there as needed; each has a `label` and `href`.
- Set `site.resumeLink` to a hosted resume URL. The dossier button will link to
  it; leave it empty until you have a resume to share.

## Other editable collections

- `education`: currently names Virginia Tech only. Add a verified program,
  dates, and coursework here if you want to share them.
- `interfaceNodes`: content for the existing interactive technical diagram.
- `tracks`: content for the existing browser-generated audio demo. The sound
  remains synthesized; it is not a recording or a claim of original music.
- `threads`, `academicInterests`, and `creativeInterests`: homepage and
  interest copy.

Run `npm run dev` to preview edits and `npm run build` to validate them.

## Archive: add photos

The Archive page has two tabs, **Photos** and **Writing**. Photos are picked
up automatically from folders, so you never have to edit code to add one.

1. Put each image in a category folder inside `src/archive/photos/`:

   ```
   src/archive/photos/
     photography/
     graphic-design/
     lab-research/
   ```

   The folder name becomes the filter chip ("graphic-design" shows as
   GRAPHIC DESIGN). To add a category, make a new folder. A folder with no
   images doesn't show a chip.
2. Save the site. The dev server (`npm run dev`) picks up new files right away;
   for the live site, run `npm run build` as usual.

**File names become titles.** `2026-09-drillfield-sunset.jpg` shows as
"DRILLFIELD SUNSET" dated 2026-09. A leading date (`2026`, `2026-09` or
`2026-09-14`) becomes the date. A leading number like `01-` only sets the order
and is hidden. Camera names such as `IMG_4821.jpg` get no title (the tile shows
"PLATE 07"), so rename the ones you want titled.

**Order.** Inside a category, images are sorted by file name, so prefix
`01-`, `02-` or a date to control it. Chip order is set by `categoryOrder` in
`src/archive/archiveInfo.ts`; folders not listed there come after, A to Z.

**Captions and nicer labels (optional)** go in `src/archive/archiveInfo.ts`:

```ts
export const categoryLabels = { 'lab-research': 'Lab / Research' };

export const captions = {
  'photography/2026-09-drillfield-sunset.jpg': 'First week on campus.',
  'graphic-design/elevate-cover.png': { title: 'Elevate cover', caption: 'Spring issue.', date: '2027' },
};
```

**Formats and size.** JPG, PNG, WebP, AVIF or GIF. iPhone HEIC photos don't
show in most browsers, so export them as JPG first. Keep each image under about
2400px on the long side and under 1 MB (Photos/Lightroom "export" at 80%
quality works well); 50 full-size phone photos would make the page slow. Images
only download when they scroll into view, and keep their own shape in the grid.

Until the first real image is added, the page shows the generated placeholder
plates from `photography` in `portfolioData.ts`. They disappear automatically
once any image is in `src/archive/photos/`.

## Archive: blog

The Archive page has two buttons at the top, PHOTOS and BLOG. The Blog tab
lists `blogPosts` from `portfolioData.ts`; clicking a post opens it in a
reading view (link straight to one with `/archive#blog/<post-id>`, or to the
list with `/archive#blog`).

Each post needs `id`, `title`, `category`, `date`, `description` and
`imageRef` (use `''`), plus `body`: one string per paragraph. A string that
starts with `## ` becomes a subheading. `readTime` (e.g. `'4 MIN'`) is
optional. A post with no `body` but an `externalLink` opens that link instead,
for posts hosted on Medium or Substack.

The `sample-post` entry is temporary: delete it once your first real post is in.
With no posts at all, the tab shows the animated COMING SOON.
