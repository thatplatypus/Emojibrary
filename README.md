# 🎨 Emojibrary

A fun and fresh emoji search and browser app built with SvelteKit, TypeScript, DaisyUI, and Tailwind CSS.

## Features

- 🔍 Search emojis by name, keywords, or code point
- 📂 Filter by category
- 📱 Progressive Web App (PWA) - works offline
- 🎨 Beautiful UI with DaisyUI themes
- ⚡ Lightning fast with static site generation
- 📦 Ad-free and open source

## Setup

1. Install dependencies:
```sh
npm install
```

2. Your emoji data should already be in place at `static/data/emoji_unicode_17_data.json`
   - The expected format is an array of emoji objects:
```json
[
  {
    "group": "Smileys & Emotion",
    "subgroup": "face-smiling",
    "status": "fully-qualified",
    "char": "😀",
    "emoji_version": "1.0",
    "name": "grinning face",
    "codepoints": ["1F600"],
    "sequence": "1F600",
    "codepoint_count": 1
  }
]
```

3. Run the development server:
```sh
npm run dev -- --open
```

## Building

To create a production build:

```sh
npm run build
```

The static site will be generated in the `build` directory.

## Project Structure

```
src/
├── lib/
│   ├── assets/          # Static assets
│   ├── types/           # TypeScript types
│   └── index.ts         # Library exports
└── routes/
    ├── +layout.svelte   # Root layout
    ├── +layout.ts       # Layout configuration
    └── +page.svelte     # Home page

static/
└── data/
    └── emoji-data.json  # Your emoji data file
```

## Tech Stack

- **SvelteKit** - Web framework with static adapter
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **DaisyUI** - Component library
- **Vite PWA** - Progressive Web App support
