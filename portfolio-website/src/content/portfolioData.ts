export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  imageRef: string;
  externalLink?: string;
};

export type SiteLink = { label: string; href: string };

export const routes = [
  { path: '/', code: '00', label: 'HOME' },
  { path: '/about', code: '01', label: 'ABOUT' },
  { path: '/research', code: '02', label: 'RESEARCH' },
  { path: '/projects', code: '03', label: 'PROJECTS' },
  { path: '/archive', code: '04', label: 'ARCHIVE' },
  { path: '/signal', code: '05', label: 'SIGNAL' },
] as const;

export const site = {
  brand: 'NIA ZAGAR',
  mark: 'NZ',
  name: 'Nia Zagar',
  role: 'Undergraduate student',
  tagline: 'Mind. Machine. Imagination.',
  location: 'VIRGINIA TECH',
  status: 'STUDENT · VIRGINIA TECH',
  email: 'niazagar@vt.edu',
  resumeLink: '',
  shortBio:
    "I'm a student exploring the intersection between neuroscience, technology, and creative expression.",
  longBio:
    "I’m a Neuroscience and HCI student at Virginia Tech, fascinated by the line where the brain ends and machines begin. I want to help build brain-computer interfaces that feel less like tools and more like extensions of ourselves. Outside the lab, I play music, shoot photos and design, because I think creativity and science run on the same signal.",
  links: [
    { label: 'LINKEDIN', href: 'https://www.linkedin.com/in/niazagar/' },
    { label: 'GITHUB', href: 'https://github.com/nvz13' },
    { label: 'SCHOLAR', href: '' },
    { label: 'INSTAGRAM', href: 'https://www.instagram.com/niavz13/' },
  ] satisfies SiteLink[],
};

// About page hero badge (top right of "THE PERSON BEHIND IT.").
// Edit labels/values freely; `live: true` adds the pulsing status dot.
export const aboutBadge: { label: string; value: string; live?: boolean }[] = [
  { label: 'LOCATION', value: 'Blacksburg, VA' },
  { label: 'STATUS', value: 'Open to research roles', live: true },
  { label: 'FOCUS', value: 'Neuroscience × BCI' },
];

// About sidebar [ CURRENTLY ] box. Keep it to a sentence or two.
export const aboutCurrently = 'Working on BCI projects and looking for research opportunities.';

export const academicInterests = [
  'Neuroscience',
  'Brain-computer interfaces',
  'Cybernetics',
  'Neural implants',
];

export const creativeInterests = [
  'Graphic design',
  'Photography',
];

export const interests = [
  ...academicInterests.map((label) => ({ label, note: 'Academic interest' })),
  ...creativeInterests.map((label) => ({ label, note: 'Creative interest' })),
];

export const threads = [
  {
    code: '01',
    title: 'NEUROSCIENCE',
    body: 'Exploring the nervous system and how it relates to emerging technology.',
    meta: 'ACADEMIC INTEREST',
  },
  {
    code: '02',
    title: 'HUMAN-COMPUTER INTERACTION',
    body: 'An interest in the ways people and interactive technologies meet.',
    meta: 'ACADEMIC INTEREST',
  },
  {
    code: '03',
    title: 'CREATIVE EXPRESSION',
    body: 'Graphic design, photography, music, writing, and digital experimentation.',
    meta: 'CREATIVE INTEREST',
  },
];

export const signalNotes = [
  {
    label: 'METHOD',
    title: 'SYNTH DEMO',
    description: 'The placeholder sound is generated in the browser with Web Audio.',
  },
  {
    label: 'CREATIVE INTEREST',
    title: 'MUSIC',
    description: 'Music is one of Nia’s stated creative interests.',
  },
  {
    label: 'CREATIVE INTEREST',
    title: 'WRITING & DIGITAL EXPERIMENTATION',
    description: 'Writing and digital experimentation are stated creative interests.',
  },
];

export const footerHeadline = ['LET’S CONNECT', 'AND CREATE', 'SOMETHING NEW.'];

export const homeModules = [
  {
    code: '01',
    title: 'ABOUT',
    to: '/about',
  },
  {
    code: '02',
    title: 'RESEARCH',
    to: '/research',
  },
  {
    code: '03',
    title: 'PROJECTS',
    to: '/projects',
  },
  {
    code: '04',
    title: 'ARCHIVE',
    to: '/archive',
  },
] as const;

export const specimenAnnotations = [
  { label: 'ORGANIC INTELLIGENCE', body: 'NEUROSCIENCE', detail: 'EMERGING TECHNOLOGY' },
  { label: 'SPECIMEN / NEURAL BLOOM', body: 'BRAIN-COMPUTER INTERFACES', detail: 'HUMAN-COMPUTER INTERACTION' },
  { label: 'MIND / MACHINE', body: 'NEUROTECHNOLOGY', detail: 'DIGITAL EXPERIMENTATION' },
  { label: 'CREATIVE EXPRESSION', body: 'DESIGN · PHOTOGRAPHY', detail: 'MUSIC · WRITING' },
];

export const projects: PortfolioItem[] = [];
// About page "Activities": clubs, teams, and roles outside class.
// `description` (one line about what you do), `date` (e.g. '2026 – Present')
// and `externalLink` are optional; leave them out until you want to add them.
export type ActivityItem = {
  id: string;
  org: string;
  role?: string;
  date?: string;
  description?: string;
  externalLink?: string;
};

export const activities: ActivityItem[] = [
  { id: 'vt-philharmonic', org: 'VT Philharmonic Orchestra', role: 'Professional Musician' },
  { id: 'orbital-launch', org: 'Orbital Launch Vehicle Team', role: 'Business & Media' },
  { id: 'elevate-magazine', org: 'Elevate Magazine', role: 'Events & Marketing Coordinator' },
  { id: 'dining-sac', org: "Dining Services' Student Advisory Council", role: 'Student Advisor' },
];
export const researchExperiences: PortfolioItem[] = [];
// Blog posts, shown in the Archive page's BLOG tab (newest first).
// `body` is the post itself: one string per paragraph. A string starting with "## " is a subheading.
// A post with no `body` but an `externalLink` opens that link instead (e.g. a Medium or Substack post).
export type BlogPost = PortfolioItem & { body?: string[]; readTime?: string };

export const blogPosts: BlogPost[] = [
  {
    id: 'a-day-as-a-hokie',
    title: 'DITL: Freshman Fall',
    category: 'Campus life',
    date: '2026-11',
    readTime: '3 MIN',
    description: 'Early classes, long walks across the Drillfield, rehearsals, and learning to make a schedule actually work.',
    imageRef: '',
    body: [
      'Three months into my first semester, I finally feel like I live here instead of visiting. So here is what an ordinary weekday looks like right now: not the brochure version, just the real one.',
      '## Mornings',
      'My alarm goes off earlier than I would like, and the first decision of the day is always the same: walk the long way across the Drillfield or cut through. I almost always take the long way. Burruss in the morning light never gets old, and it is the only fifteen minutes of the day where nobody needs anything from me.',
      'Breakfast is usually something quick from a dining hall, eaten while rereading my notes. Sitting on the dining services student advisory council has ruined me a little. I now notice every menu change and have opinions about all of them.',
      '## Classes',
      'Most of my day is lectures and recitations: biology, chemistry, psychology, and the intro classes that every neuroscience major goes through. The workload is real, but what surprised me most is how much of college is figuring out how you learn. I have rebuilt my study system three times this semester. The current version is a paper planner, a lot of color-coding, and studying in the same library corner every day so my brain knows it is time to focus.',
      'The HCI side of my degree is where things click. Thinking about how people actually use technology, and not just how it works, is exactly the lens I want to bring to brain–computer interfaces one day.',
      '## Afternoons',
      'Afternoons are for everything outside of class. A few times a week I am at rehearsal with the VT Philharmonic, which is still my favorite part of the week: two hours where I am not thinking about exams at all. Other days I am working on media for the Orbital Launch Vehicle Team, or planning events for Elevate Magazine. Somehow the busier I am, the better I manage my time.',
      'I also try to fit in one small side project each week, like editing photos, designing something, or slowly building this website.',
      '## Evenings',
      'Dinner is the one meal I try to share with friends, even when everyone has a problem set waiting. After that it is homework, usually with music on, until I hit the point where I am rereading the same paragraph. Some nights end with a walk around campus. Some end with way too long a conversation in the dorm hallway. Both count as important.',
      '## What I have learned so far',
      'You do not have to have it all figured out in your first semester. Say yes to things early, then keep only what you love. Sleep is not optional, and I learned that the hard way. And the best moments are rarely the planned ones: the late-night food runs, the game days, the random conversation that turns into a friendship.',
      'More soon. Probably once finals are over and I have slept.',
    ],
  },
];
// About page "Skills & Tools", shown as labeled groups of tags.
export const skills: { group: string; items: string[] }[] = [
  {
    group: 'Tools',
    items: ['Figma', 'CapCut', 'Lightroom', 'Google Workspace', 'AI LLMs'],
  },
  {
    group: 'Skills',
    items: ['Graphic design', 'Marketing', 'Photography'],
  },
];

export const education: {
  period: string;
  degree: string;
  place: string;
  note?: string;
  courses: string[];
  // Clubs, teams, and roles shown under the degree. `role` is optional.
  involvement?: { name: string; role?: string }[];
}[] = [
  {
    period: '2026 – 2030',
    degree: 'B.S. in Neuroscience and Human-Computer Interaction',
    place: 'Virginia Tech',
    // Optional: a one-line note, and courses shown as tags, e.g. ['Intro to Neuroscience']
    note: '',
    courses: [],
  },
];

// Projects page (/projects). Each entry is one card; clicking it opens the detail view.
// Required: id, title, summary (one line), tags, status, year.
// Optional, shown in the detail view: role, tools, overview (one string per paragraph),
// images and links. Leave optional fields out and their sections are hidden.
// Images: put files in a `public/projects/` folder and write src: 'projects/your-file.jpg'.
// The filter chips above the grid are built from the tags automatically.
// Keep tags to 1–2 broad categories per project (e.g. Neurotech, Machine learning, Creative).
export type ProjectStatus = 'In progress' | 'Complete' | 'Planned';

export type ProjectEntry = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  status: ProjectStatus;
  year: string;
  role?: string;
  tools?: string[];
  overview?: string[];
  images?: { src: string; alt: string; caption?: string }[];
  links?: { label: string; href: string }[];
  // Optional, detail view only: a highlighted status line at the top (e.g. "In progress: ...").
  progressNote?: string;
  // Optional short facts for the side column, e.g. { label: 'Data', value: '...' }.
  facts?: { label: string; value: string }[];
  // Optional "what I'm building" cards: a short title and one line each.
  highlights?: { title: string; text: string }[];
  // Optional extra sections under the overview. Each has a heading and paragraphs and/or bullets.
  sections?: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
  // Optional roadmap. Mark the stage you are on now with current: true; earlier stages show as done.
  roadmap?: { stage: string; when: string; goal: string; deliverable?: string; current?: boolean }[];
  // Optional reading list.
  references?: string[];
  // true only for the temporary sample below; shows a "SAMPLE" badge.
  sample?: boolean;
};

export const projectEntries: ProjectEntry[] = [
  {
    id: 'intracortical-bci-decoder',
    title: 'Intracortical BCI Decoder',
    summary: 'Developing a BCI that translates neural activity into cursor movement using machine learning.',
    tags: ['Neurotech', 'Machine learning'],
    status: 'In progress',
    year: '2026',
    role: 'Independent project',
    tools: ['Python', 'NumPy', 'PyTorch', 'nlb_tools'],
    facts: [
      { label: 'Data', value: 'Neural Latents Benchmark: monkey motor cortex, Utah arrays (DANDI)' },
      { label: 'Timeline', value: '~6 months' },
    ],
    overview: [
      'A motor brain–computer interface decoder, built end to end: it turns spikes from an implanted Utah array into cursor movement, and keeps working as the implant drifts and loses channels.',
    ],
    highlights: [
      { title: 'Kalman filter', text: 'The classic BCI decoder, written from scratch.' },
      { title: 'RNN + transformer', text: 'Deep decoders, benchmarked on accuracy and speed.' },
      { title: 'Closed-loop cursor', text: 'A simulated user steering a cursor in real time.' },
      { title: 'Self-recalibration', text: 'Stays accurate as electrodes drift and drop out.' },
    ],
    roadmap: [
      { stage: 'Foundations', when: 'Months 1–3', goal: 'Python, math and neuroscience basics', current: true },
      { stage: 'Kalman filter', when: 'Weeks 1–4', goal: 'First decoder on real neural data' },
      { stage: 'Deep decoders', when: 'Weeks 5–7', goal: 'RNN and transformer vs Kalman' },
      { stage: 'Closed loop', when: 'Weeks 8–10', goal: 'Simulated cursor task with drift' },
      { stage: 'Stretch', when: 'Weeks 11–12', goal: 'Human data or foundation models' },
    ],
  },
];

export type Track = PortfolioItem & {
  index: string;
  bpm: number;
  length: string;
  chord: number[];
};

export const tracks: Track[] = [
  {
    id: 'synth-demo',
    index: '01',
    title: 'SYNTH DEMO',
    category: 'SYNTH DEMO',
    date: 'ADD DATE',
    description: 'Browser-generated placeholder audio. Replace the track details when you have music to share.',
    imageRef: '',
    bpm: 92,
    length: '—',
    chord: [110, 164.81, 220, 277.18],
  },
];

export type Plate = PortfolioItem & {
  category: 'FILM' | 'DIGITAL' | 'MICRO';
  palette: [string, string, string];
  seed: number;
  ratio: 'tall' | 'wide' | 'square';
};

export const photography: Plate[] = [
  {
    id: 'photo-01',
    title: 'ADD PHOTO 01',
    category: 'FILM',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#f4ecdf', '#e8799a', '#5a0e24'],
    seed: 3,
    ratio: 'tall',
  },
  {
    id: 'photo-02',
    title: 'ADD PHOTO 02',
    category: 'MICRO',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#5a0e24', '#f7afc4', '#ffd3e0'],
    seed: 8,
    ratio: 'wide',
  },
  {
    id: 'photo-03',
    title: 'ADD PHOTO 03',
    category: 'DIGITAL',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#3d0718', '#8a1235', '#ffd3e0'],
    seed: 14,
    ratio: 'tall',
  },
  {
    id: 'photo-04',
    title: 'ADD PHOTO 04',
    category: 'FILM',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#f4ecdf', '#f7afc4', '#8a1235'],
    seed: 21,
    ratio: 'square',
  },
  {
    id: 'photo-05',
    title: 'ADD PHOTO 05',
    category: 'MICRO',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#ffd3e0', '#e8799a', '#3d0718'],
    seed: 29,
    ratio: 'tall',
  },
  {
    id: 'photo-06',
    title: 'ADD PHOTO 06',
    category: 'DIGITAL',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#5a0e24', '#f4ecdf', '#e8799a'],
    seed: 34,
    ratio: 'wide',
  },
  {
    id: 'photo-07',
    title: 'ADD PHOTO 07',
    category: 'FILM',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#e8799a', '#ffd3e0', '#5a0e24'],
    seed: 42,
    ratio: 'square',
  },
  {
    id: 'photo-08',
    title: 'ADD PHOTO 08',
    category: 'DIGITAL',
    date: 'ADD DATE',
    description: 'Placeholder — add a photograph, date, and caption.',
    imageRef: '',
    palette: ['#f4ecdf', '#5a0e24', '#f7afc4'],
    seed: 51,
    ratio: 'tall',
  },
];

export const plates = photography;
