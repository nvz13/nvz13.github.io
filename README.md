# Nia Zagar — personal portfolio

An animated portfolio built with React, TypeScript, Vite, and anime.js. The
existing visual system, interactive specimen, technical illustrations, audio
visualiser, themes, route transitions, and motion are retained.

## Run it

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Edit the content

Personal details and the editable content collections live in
[`src/content/portfolioData.ts`](src/content/portfolioData.ts). Read
[`CONTENT_GUIDE.md`](CONTENT_GUIDE.md) for step-by-step instructions for
biography, projects, activities, photos, blog posts, contact links, and resume.
Unprovided items are empty collections or explicitly marked placeholders.

## Project structure

```text
src/
  content/portfolioData.ts  personal information and editable collections
  components/               navigation, loader, specimen, footer, and UI
  lib/                      routing, theme, motion, and audio helpers
  pages/                    homepage and five portfolio sections
  styles/                   existing design tokens and styles
```

The production build is a static SPA. Configure the host to serve `index.html`
for the portfolio routes.
