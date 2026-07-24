# sample240726

A sandbox app for getting to know [Claude Code](https://claude.com/claude-code) by running it against real use cases.

## Purpose

This repository exists to **learn Claude Code by using it**, not to ship a product. The Ionic app is deliberately a plain starter — it's a realistic-but-small codebase to point Claude Code at while trying things out:

- generating pages, components, and services
- refactoring across files and following conventions already in the repo
- writing and fixing tests
- reviewing code and hunting bugs
- writing and maintaining project docs like `CLAUDE.md`
- custom agents, skills, hooks, and settings under `.claude/`

Expect the app itself to grow in unrelated directions as different use cases get tried. Coherence of the product is not a goal; coverage of Claude Code's capabilities is.

`CLAUDE.md` is the project's instruction file for Claude Code — it describes the stack, commands, and conventions so Claude has the same context you do. Keeping it accurate is part of the exercise.

## Stack

- **Ionic 8** UI components, standalone-only (no NgModules)
- **Angular 20** with the standalone bootstrap and lazy `loadComponent` routes
- **Capacitor 8** for native iOS/Android packaging
- **TypeScript** in `strict` mode, ESLint, Karma + Jasmine

## Getting started

```bash
npm install
npm start          # dev server on http://localhost:4200
```

## Commands

```bash
npm start                    # ng serve — dev server
npm run build                # production build → www/
npx ng build -c development  # unoptimized build with source maps
npm run watch                # development build in watch mode
npm run lint                 # ESLint over src/**/*.ts and src/**/*.html
npm test                     # Karma + Jasmine, watch mode, launches Chrome
npx ng test --watch false    # one-shot test run
```

## Native builds

No `android/` or `ios/` directory exists yet, so add a platform before the first sync:

```bash
npx cap add ios              # or: android
npm run build && npx cap sync
```

`cap sync` copies from `www/`, which is the Angular builder's output directory, so a build has to run first.

## Layout

```
src/
  app/
    app.component.ts     # root shell
    app.routes.ts        # lazy routes via loadComponent
    home/                # the one page in the starter
  environments/          # swapped by fileReplacements in angular.json
  theme/variables.scss   # Ionic CSS custom properties
  global.scss            # Ionic CSS layers + system dark palette
.claude/
  agents/                # custom subagents
CLAUDE.md                # instructions Claude Code reads on every session
```
