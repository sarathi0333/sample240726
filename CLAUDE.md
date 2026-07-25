# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Ionic 8 + Angular 20 app wrapped by Capacitor 8, generated from the Ionic "blank" starter (`ionic.config.json` → `type: angular-standalone`). Currently just the scaffold: one route (`home`) and one page component.

This is a learning sandbox: its purpose is to exercise Claude Code across different use cases (generating pages, refactoring, tests, reviews, custom agents/skills/hooks), not to ship a product. Features may be unrelated to each other — that's expected. The conventions below still apply to everything added here.

## Commands

```bash
npm start                    # ng serve — dev server on http://localhost:4200
npm run build                # production build (the default configuration) → www/
npx ng build -c development  # unoptimized build with source maps
npm run watch                # development build in watch mode
npm run lint                 # ESLint over src/**/*.ts and src/**/*.html
npm test                     # Karma + Jasmine, watch mode, launches Chrome
```

Single test file / single run:

```bash
npx ng test --include src/app/home/home.page.spec.ts
npx ng test --watch false                 # one-shot
npx ng test -c ci                         # no progress output, no watch
```

Capacitor — `ios/` exists; `android/` has not been added yet:

```bash
npm run build && npx cap sync   # after any web change
npx cap open ios                # opens Xcode
npx cap add android             # android/ does not exist yet
```

`cap sync` copies from `www/`, which is also the Angular builder's `outputPath`, so a build must run first. Capacitor 8 resolves iOS plugins through Swift Package Manager (`ios/App/CapApp-SPM/Package.swift`) — there is no Podfile and CocoaPods is not required.

## Architecture

**Standalone-only, no NgModules.** Bootstrapping is `bootstrapApplication` in `src/main.ts`, wiring up `provideIonicAngular()`, `provideRouter(routes, withPreloading(PreloadAllModules))`, and `IonicRouteStrategy` (Ionic's route reuse strategy, required for correct page caching and transitions).

**Ionic components are imported per-component from `@ionic/angular/standalone`** — not from `@ionic/angular` — and listed in the component's own `imports` array (see `src/app/home/home.page.ts`). Keep to that single entrypoint; mixing in the module-based `@ionic/angular` package defeats the tree-shaking this setup relies on. Ionicons used in templates must be registered explicitly with `addIcons({ ... })` from `ionicons`; standalone mode has no global icon registry.

**Routing** lives in `src/app/app.routes.ts` and uses `loadComponent` lazy imports. New pages should follow the same pattern; generate them with `npx ng generate page <name>` — `@ionic/angular-toolkit` is the default schematic collection here and emits standalone pages with SCSS.

**Environments** are swapped via `fileReplacements` in `angular.json`: the production build replaces `src/environments/environment.ts` with `environment.prod.ts`. Any new config key must be added to both files.

**Styles**: `src/global.scss` imports the Ionic CSS layers and enables the system dark palette (`palettes/dark.system.css`); `src/theme/variables.scss` holds the Ionic CSS custom properties. Both are registered as global styles in `angular.json`. The production budget caps any single component stylesheet at 4 kb (warning at 2 kb).

**Zone.js change detection** is in use — `src/polyfills.ts` imports `zone.js`, with `src/zone-flags.ts` reserved for zone patch flags. This is not a zoneless app.

**Push notifications** go through `PushNotificationsService` (`src/app/services/`), which owns permission, registration, and the four plugin listeners, exposing state as signals. `AppComponent.ngOnInit` calls `initialize()`; it early-returns on non-native platforms, so `ng serve` never touches the plugin. iOS delivery also depends on the two APNs callbacks in `ios/App/App/AppDelegate.swift` — Capacitor's template omits them, so don't drop them if the file is ever regenerated.

## Conventions enforced by tooling

- TypeScript `strict`, plus `noPropertyAccessFromIndexSignature`, `noImplicitReturns`, `noImplicitOverride`; Angular `strictTemplates` is on.
- ESLint uses the **legacy** `.eslintrc.json` format even though ESLint 9 is installed. Don't migrate to flat config piecemeal — the `@angular-eslint/builder` wiring in `angular.json` has to move with it.
- Component selectors: `app-` prefixed kebab-case elements. Directive selectors: `app` camelCase attributes. Component class names must end in `Page` or `Component`.
- Browser targets (`.browserslistrc`): Chrome/Edge ≥107, Firefox ≥106, Safari/iOS ≥16.1.
