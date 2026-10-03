# HubMe Clickable Frontend Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 12 screens of the "HubMe Makiety" design as a clickable React app that runs on the mockups' example data.

**Architecture:** A React Router app with two layouts (public top bar, ROPS sidebar). Screens read data only through a typed `HubApi` interface provided by context; the only implementation is an in-process mock backed by an in-memory store. Styling is CSS Modules over design tokens in CSS custom properties.

**Tech Stack:** React 19.3, TypeScript 5.9 (strict), Vite 8, React Router 7, Vitest 5 with jsdom and Testing Library, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-10-03-hubme-frontend-demo-design.md`

## Global Constraints

- **Node 24 only.** `.npmrc` sets `engine-strict`. Run `nvm use` in `frontend/` before any `npm` command.
- **All commands run from `frontend/`** unless a step says otherwise.
- **Dependencies:** add only `react-router`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`. No icon, UI, state or CSS library.
- **Copy is Polish and verbatim** from the mockup files in `docs/design/hubme-makiety/`. Do not translate, reword or "fix" it.
- **Colours come only from tokens** in `src/ui/tokens.css`. No hex value in any other CSS file or in TSX.
- **Sizes are in `rem`**: mockup pixels divided by 16 (`18px` → `1.125rem`). Border widths stay in `px`.
- **Screens never import from `src/api/mock/`.** They call `useApi()`.
- **`ui/` imports nothing from `shell/`, `features/`, `app/` or `api/`.**
- **Layout:** matches the mockup at 1440px, fluid to 1024px. `body` has `min-width: 64rem`.
- **Lint is strict and has zero tolerance for warnings.** Fix lint errors in the code; never add `eslint-disable`. The rules that shape every file:
  - every function has an explicit return type; every parameter and every non-destructured variable declaration has a type annotation (`const count: number = 0;`)
  - type-only imports use `import type`
  - an arrow function that returns nothing uses a block body: `(): void => { setOpen(true); }`, never `() => setOpen(true)`
  - numbers in template literals are wrapped: `${String(count)}`
  - promises in event handlers are discarded explicitly: `void navigate('/')`
  - no non-null assertions (`!`); narrow with an `if`
  - a `.tsx` file that exports a component exports no other runtime value (types are fine); contexts, hooks and constants live in a sibling `.ts` file
  - these rules apply to test files too, including callbacks passed to `map` or `filter` inside `expect(...)`: where a test in this plan writes `(row) => row.title`, annotate it (`(row: QueueRow): string => row.title`) and import the type
  - do not call a state setter synchronously in an effect body, and do not write `ref.current` during render
- **Formatting:** run `npm run format` before each commit.
- **Commits** end with the attribution trailer lines the session's instructions give at execution time (the `Co-Authored-By:` line and, when provided, the `Claude-Session:` line). The `git commit -m` examples below omit them for brevity.
- **Per-task gate:** `npm run check` passes (lint, format check, typecheck, tests, build).
- **Tests and navigation:** an assertion made right after a click that navigates may run before the new screen renders. If such a `getBy…` assertion fails intermittently, change it to `await screen.findBy…`; do not add timeouts or sleeps.
- **Deviations from the spec's wording**, all recorded in the spec's "Implementation notes": `useAsync` takes a string key; contexts live in one file `app/contexts.ts`; `features/thread/` holds what both C3 views share; notifications created while their recipient is signed out are queued and delivered on the next subscription.

## Mockup transcription rules

The mockup files are the markup and style specification. Screen tasks below give
the component logic, the data flow and the tests in full, and one fully worked
screen (M1 in Task 7) as the reference. For the remaining visual markup, apply
these rules to the named mockup file instead of inventing layout:

| Mockup construct | Becomes |
|---|---|
| `style="..."` on an element | a class in the screen's `.module.css`; one class per distinct element role |
| any hex colour | the matching `var(--c-…)` token from `tokens.css` |
| `Npx` sizes | `N/16 rem`; border widths stay `px` |
| outer `width:1440px` wrapper | dropped; the layout provides the page width |
| `<main style="width:Npx;margin:0 auto">` | `max-width: N/16 rem; margin-inline: auto; padding-inline: 2rem` |
| `<main style="padding:… 56px …">` | same padding in `rem` |
| `<sc-if value="{{ x }}">` | `{x ? … : null}` |
| `<sc-for list="{{ xs }}" as="x">` | `xs.map(...)` with a stable `key` |
| `<dc-import name="HubTopBar">` / `RopsSidebar` | nothing; the layout renders the shell |
| `{{ value }}` | the corresponding field from the `HubApi` result or component state |
| a `div` drawn as an input, select or textarea | a real `input`, `select` or `textarea` with a `<label htmlFor>` |
| a `span` drawn as a selectable chip | `ChoiceChip` from `ui/` |
| a `span role="tab"` | a `button role="tab"` |
| `href="#"` links | a router `Link` to the route named in the task, or a `button` calling `toast.stub()` |
| skeleton `div`s (`background:#ECECEC`) | `Skeleton` from `ui/` |
| the "AI" black badge and dashed frame | `AiBadge` from `ui/` and the `.ai` frame class |
| ARIA attributes (`role`, `aria-live`, `aria-current`, `aria-label`) | kept as written |

Every button and link listed in a task's **Contract** table must have exactly
that accessible name, because the tests select by it.

## File Structure

All paths are under `frontend/src/` unless they start with `docs/` or `frontend/`.

| Path | Responsibility |
|---|---|
| `docs/design/hubme-makiety/*.dc.html` | snapshot of the canvas and the 14 mockup component files |
| `main.tsx`, `App.tsx` | entry; `App` creates the mock API and the browser router |
| `test/setup.ts`, `test/renderApp.tsx` | test setup and the integration-test render helper |
| `ui/tokens.css`, `ui/base.css` | design tokens, global reset |
| `ui/*.tsx` + `ui/*.module.css` | `Button`, `ChoiceChip`, `Card`, `AiBadge`, `Skeleton`, `FieldError`, `Stepper`, `StatusPill`, `Switch`, `LoadError` |
| `api/types.ts` | all domain types |
| `api/examples.ts`, `api/status.ts` | form defaults that screens pre-fill; status-to-pill mapping |
| `api/HubApi.ts` | the `HubApi` interface |
| `api/personas.ts` | the three personas |
| `api/mock/dates.ts` | Polish date formatting |
| `api/mock/data/*.ts` | example data transcribed from the mockups |
| `api/mock/store.ts` | in-memory cases, threads, notifications |
| `api/mock/createMockApi.ts` | `HubApi` implementation with simulated delay |
| `app/contexts.ts` | the seven contexts, their value types and their hooks |
| `app/AppProviders.tsx` | all providers, in order |
| `app/useAsync.ts` | load / ready / error / retry |
| `app/RequirePersona.tsx` | route guard |
| `app/routes.tsx` | the route table |
| `shell/navigation.ts` | nav tables, active-item and AI-notice rules, stub page titles |
| `shell/*.tsx` | `Root`, `PublicLayout`, `RopsLayout`, `HubTopBar`, `AiNotice`, `Footer`, `RopsSidebar`, `PersonaPicker`, `NotificationsPopover`, `ToastViewport`, `DemoStub` |
| `features/matchmaking/` | `StartScreen` (M1), `PreviewScreen` (M2), `ProblemCardScreen` + `ProblemCardEditor` (M3), `ResultsScreen` + `MatchReason` + `LocalStatsPanel` (M4), `FlowSteps` |
| `features/innovation/` | `InnovationScreen` (Z2) |
| `features/adaptation/` | `ProfileScreen` (MW1), `DraftScreen` (MW2), `useDraft`, `profile.ts` (parse and step logic) |
| `features/idea/` | `IdeaScreen` (K1), `validateIdea` |
| `features/thread/` | `useThread`, `Composer`, shared by both C3 views |
| `features/cases/` | `CasesScreen`, `AuthorThreadScreen` (C3 author) |
| `features/rops/` | `QueueScreen` (A2), `CuratorThreadScreen` (C3 curator), `TrendsScreen` (A6), `trends.ts`, `caseTypes.ts` |

---

### Task 1: Snapshot the mockups into the repo

This task needs the `DesignSync` tool with design authorization, so **the
controlling session runs it itself; do not delegate it to a subagent.** If
`DesignSync` reports missing authorization, ask the user to run `/design-login`.

**Files:**
- Create: `docs/design/hubme-makiety/` with 15 files

- [ ] **Step 1: Fetch and write each file**

For each name below, call `DesignSync` with `method: "get_file"`,
`projectId: "845e1554-3d2e-429d-a42d-ac4897f0e048"`, `path: "<name>"`, and write
the returned `content` string, unmodified, to `docs/design/hubme-makiety/<name>`:

```
HubMe Makiety.dc.html
HubTopBar.dc.html
RopsSidebar.dc.html
M1-Start.dc.html
M2-Podglad.dc.html
M3-KartaProblemu.dc.html
M4-Wyniki.dc.html
Z2-KartaInnowacji.dc.html
MW1-ProfilInstytucji.dc.html
MW2-SzkicUslugi.dc.html
K1-Fiszka.dc.html
A2-Kolejka.dc.html
C3-Watek.dc.html
C1-Powiadomienia.dc.html
A6-Trendy.dc.html
```

That is 15 names: the canvas plus 14 component files. Do not fetch `support.js`
or anything under `archiwum-v1-ciepla/`.

- [ ] **Step 2: Verify**

Run from the repo root:

```bash
ls docs/design/hubme-makiety | wc -l && grep -L '<x-dc>' docs/design/hubme-makiety/*
```

Expected: `15`, and no file names printed after it.

- [ ] **Step 3: Commit**

The snapshot is outside `frontend/`, so Prettier and ESLint do not see it.

```bash
git add docs/design/hubme-makiety
git commit -m "docs: snapshot HubMe mockup sources"
```

---

### Task 2: Tooling, tokens and an empty app

**Files:**
- Modify: `frontend/package.json`, `frontend/package-lock.json`, `frontend/vitest.config.ts`, `frontend/eslint.config.js`, `frontend/index.html`, `frontend/src/main.tsx`, `frontend/src/App.tsx`
- Create: `frontend/src/test/setup.ts`, `frontend/src/ui/tokens.css`, `frontend/src/ui/base.css`, `frontend/src/App.test.tsx`
- Delete: `frontend/src/styles.css`, `frontend/src/components/ApiStatus.tsx`, `frontend/src/hooks/useApiHealth.ts`

**Interfaces:**
- Produces: the token names in `tokens.css` (used by every CSS file), the test setup, and `App` as the root component.

- [ ] **Step 1: Install Node 24 and the dependencies**

```bash
cd frontend
nvm install 24 && nvm use
npm ci --no-audit --no-fund
npm install react-router
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Expected: `package.json` gains `react-router` under `dependencies` and the four
test packages under `devDependencies`, all with exact versions.

- [ ] **Step 2: Write the failing smoke test**

`src/App.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { App } from './App';

describe('App', (): void => {
  it('renders the HubMe brand', (): void => {
    render(<App />);
    expect(screen.getByText('HubMe')).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Configure Vitest for jsdom**

Replace `vitest.config.ts`:

```ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
  },
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach((): void => {
  cleanup();
  window.sessionStorage.clear();
  document.documentElement.style.fontSize = '';
});
```

In `eslint.config.js`, add this block as the last element of the
`tseslint.config(...)` call, so test helpers may export non-components:

```js
  {
    files: ['src/test/**/*.{ts,tsx}', 'src/**/*.test.{ts,tsx}'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — the placeholder page does not contain the text "HubMe".

If `src/api/health.test.ts` now fails because jsdom lacks `AbortSignal.any`,
add `// @vitest-environment node` as the first line of that file.

- [ ] **Step 5: Add tokens and base styles**

`src/ui/tokens.css`:

```css
:root {
  --c-primary: #2462ad;
  --c-primary-dark: #0f4a91;
  --c-primary-line: #2e63a8;
  --c-primary-tint: #e8f0f9;
  --c-primary-tint-2: #f3f7fc;
  --c-blue-300: #88c1e9;
  --c-blue-200: #b9e0f7;
  --c-blue-bar: #c5d6ea;
  --c-blue-edge: #b9cde4;
  --c-success: #1e7a3c;
  --c-success-tint: #e6f2ea;
  --c-danger: #c8000e;
  --c-highlight: #fff4d6;
  --c-ink: #292929;
  --c-ink-2: #333333;
  --c-muted: #4d504d;
  --c-line-strong: #8a8a8a;
  --c-grey-400: #bdbdbd;
  --c-line: #e6e6e6;
  --c-skeleton: #ececec;
  --c-divider: #efefef;
  --c-grey-100: #f3f3f3;
  --c-surface: #f6f6f6;
  --c-white: #ffffff;
  --c-shadow: rgb(36 31 27 / 18%);

  --font-sans: 'Red Hat Display', system-ui, sans-serif;
  --font-mono: 'Red Hat Mono', ui-monospace, monospace;
  --radius: 0.25rem;
  --target: 2.75rem;
}
```

`src/ui/base.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 64rem;
  background: var(--c-white);
  color: var(--c-ink);
  font-family: var(--font-sans);
  font-size: 1.125rem;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
p,
figure,
blockquote {
  margin: 0;
}

a {
  color: var(--c-primary);
}

a:hover {
  color: var(--c-primary-dark);
}

button,
input,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

:focus-visible {
  outline: 2px solid var(--c-primary);
  outline-offset: 3px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

- [ ] **Step 6: Replace the placeholder app**

Delete `src/styles.css`, `src/components/ApiStatus.tsx` and
`src/hooks/useApiHealth.ts` (and the now-empty `components/` and `hooks/`
folders).

`src/App.tsx`:

```tsx
import type { ReactElement } from 'react';

export function App(): ReactElement {
  return <p>HubMe</p>;
}
```

In `src/main.tsx`, replace `import './styles.css';` with:

```ts
import './ui/tokens.css';
import './ui/base.css';
```

Replace `index.html`:

```html
<!doctype html>
<html lang="pl">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#2462ad" />
    <meta
      name="description"
      content="HubMe — Hub Innowacji Społecznych. Wersja demonstracyjna."
    />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@400;500;600;700&family=Red+Hat+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
    <title>HubMe</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Run the full check**

Run: `npm run format && npm run check`
Expected: PASS — lint, format, typecheck, 2 test files, build.

- [ ] **Step 8: Commit**

```bash
git add -A frontend
git commit -m "chore: add router and test tooling, tokens, empty HubMe app"
```

---

### Task 3: Domain types, example data and the in-memory store

**Files:**
- Create: `src/api/types.ts`, `src/api/HubApi.ts`, `src/api/personas.ts`, `src/api/mock/dates.ts`, `src/api/mock/data/cases.ts`, `src/api/mock/store.ts`
- Test: `src/api/mock/store.test.ts`, `src/api/mock/dates.test.ts`

**Interfaces:**
- Produces: every type in `types.ts`; `HubApi`; `PERSONAS`; `createStore(now?): Store`.

- [ ] **Step 1: Write the types**

`src/api/types.ts`:

```ts
export type PersonaId = 'ewa' | 'maria' | 'anna';
export type PersonaRole = 'user' | 'curator';

export interface Persona {
  readonly id: PersonaId;
  readonly name: string;
  readonly initials: string;
  readonly role: PersonaRole;
  readonly description: string;
  readonly threadRole: string;
}

// ── Matchmaking ──────────────────────────────────────────────
export interface Replacement {
  readonly id: string;
  readonly icon: string;
  readonly tag: string;
  readonly inlineLabel: string;
  readonly kind: string;
  readonly original: string;
  readonly restorable: boolean;
}

export type RedactionSegment =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'replacement'; readonly replacementId: string };

export interface RedactionResult {
  readonly segments: readonly RedactionSegment[];
  readonly replacements: readonly Replacement[];
}

export interface ProblemInput {
  readonly description: string;
  readonly municipality: string;
  readonly onBehalf: boolean;
}

export interface ChipGroup {
  readonly id: string;
  readonly label: string;
  readonly chips: readonly string[];
}

export interface Question {
  readonly id: string;
  readonly title: string;
  readonly options: readonly string[];
  readonly suggested: string | null;
}

export interface ProblemCard {
  readonly summary: string;
  readonly groups: readonly ChipGroup[];
  readonly questions: readonly Question[];
}

export type MatchBand = 'strong' | 'medium' | 'weak';

export interface FitTag {
  readonly label: string;
  readonly ok: boolean;
}

export interface MatchCard {
  readonly innovationId: string;
  readonly name: string;
  readonly category: string;
  readonly band: MatchBand;
  readonly fit: readonly FitTag[];
  readonly verified: string;
  readonly cost: string;
}

export interface SimilarProblem {
  readonly quote: string;
  readonly innovationId: string;
  readonly source: string;
}

export interface MatchResults {
  readonly searchTerms: readonly string[];
  readonly cards: readonly MatchCard[];
  readonly similar: readonly SimilarProblem[];
  readonly similarCount: number;
}

export interface ReasonSegment {
  readonly text: string;
  readonly highlight: boolean;
}

export interface StatRow {
  readonly who: string;
  readonly value: number;
  readonly primary: boolean;
}

export interface LocalStat {
  readonly label: string;
  readonly max: number;
  readonly rows: readonly StatRow[];
}

export interface LocalStats {
  readonly stats: readonly LocalStat[];
  readonly source: string;
}

// ── Innovation ───────────────────────────────────────────────
export interface LabelledValue {
  readonly label: string;
  readonly value: string;
}

export interface Review {
  readonly heading: string;
  readonly quote: string;
}

export interface Innovation {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly verified: string;
  readonly cost: string;
  readonly seeksTesters: boolean;
  readonly hasVideo: boolean;
  readonly author: string;
  readonly incubator: string;
  readonly rating: string;
  readonly reviewCount: number;
  readonly testerNote: string;
  readonly facts: readonly LabelledValue[];
  readonly materials: readonly string[];
  readonly steps: readonly string[];
  readonly fundingProgrammes: readonly string[];
  readonly fundingNote: string;
  readonly reviews: readonly Review[];
}

// ── Adaptation ───────────────────────────────────────────────
export interface MunicipalityFacts {
  readonly title: string;
  readonly rows: readonly LabelledValue[];
  readonly source: string;
}

export interface InstitutionProfile {
  readonly municipality: string;
  readonly audience: string;
  readonly recipients: number;
  readonly budget: string;
  readonly staff: string;
  readonly resources: readonly string[];
}

export type ScheduleTone = 'prepare' | 'run' | 'review';

export interface ScheduleRow {
  readonly label: string;
  readonly from: number;
  readonly to: number;
  readonly tone: ScheduleTone;
}

export type DraftSection =
  | {
      readonly id: string;
      readonly heading: string;
      readonly kind: 'text';
      readonly text: string;
    }
  | {
      readonly id: string;
      readonly heading: string;
      readonly kind: 'schedule';
      readonly months: readonly string[];
      readonly rows: readonly ScheduleRow[];
    }
  | {
      readonly id: string;
      readonly heading: string;
      readonly kind: 'costs';
      readonly rows: readonly LabelledValue[];
      readonly total: string;
    };

// ── Ideas, cases, threads ────────────────────────────────────
export type IdeaStage =
  | 'Pomysł'
  | 'Prototyp'
  | 'Testowane w mikroskali'
  | 'Działa';

export interface IdeaForm {
  readonly name: string;
  readonly summary: string;
  readonly audience: string;
  readonly problem: string;
  readonly stage: IdeaStage;
  readonly email: string;
}

export type CaseType =
  | 'Potrzeba'
  | 'Pomysł'
  | 'Opinia'
  | 'Do testów'
  | 'Zapytanie';

export type CaseStatus =
  | 'Nowe'
  | 'W trakcie'
  | 'Odpowiedziano'
  | 'Ponad 48 h'
  | 'Zamknięte';

export interface SubmittedCase {
  readonly id: string;
  readonly title: string;
  readonly replyBy: string;
}

export interface CaseSummary {
  readonly id: string;
  readonly type: CaseType;
  readonly title: string;
  readonly status: CaseStatus;
}

export interface Message {
  readonly id: string;
  readonly from: PersonaId | null;
  readonly authorName: string;
  readonly initials: string;
  readonly role: string;
  readonly time: string;
  readonly text: string;
}

export interface CaseTimeline {
  readonly sent: string;
  readonly inProgress: string | null;
  readonly answered: string | null;
  readonly closed: string | null;
}

export interface CaseThread {
  readonly id: string;
  readonly type: CaseType;
  readonly title: string;
  readonly status: CaseStatus;
  readonly authorId: PersonaId | null;
  readonly area: string;
  readonly place: string;
  readonly stage: string | null;
  readonly expert: string | null;
  readonly timeline: CaseTimeline;
  readonly messages: readonly Message[];
}

export interface QueueRow {
  readonly id: string;
  readonly type: CaseType;
  readonly title: string;
  readonly area: string;
  readonly place: string;
  readonly date: string;
  readonly status: CaseStatus;
  readonly expert: string | null;
  readonly flagged: boolean;
}

export interface QueueFilter {
  readonly type: CaseType | null;
}

export interface QueuePage {
  readonly rows: readonly QueueRow[];
  readonly total: number;
  readonly open: number;
  readonly fresh: number;
  readonly overdue: number;
}

export interface Notification {
  readonly id: string;
  readonly icon: string;
  readonly text: string;
  readonly type: string;
  readonly time: string;
  readonly unread: boolean;
  readonly caseId: string | null;
}

// ── Trends ───────────────────────────────────────────────────
export interface AreaTrend {
  readonly area: string;
  readonly values: readonly number[];
}

export interface DistrictTile {
  readonly name: string;
  readonly abbr: string;
  readonly row: number;
  readonly col: number;
  readonly value: number;
}

export interface Gap {
  readonly title: string;
  readonly count: number;
  readonly districts: number;
  readonly last: string;
}

export interface Trends {
  readonly months: readonly string[];
  readonly areas: readonly AreaTrend[];
  readonly districts: readonly DistrictTile[];
  readonly gaps: readonly Gap[];
}
```

- [ ] **Step 2: Write the interface and the personas**

`src/api/HubApi.ts`:

```ts
import type {
  CaseSummary,
  CaseThread,
  DraftSection,
  IdeaForm,
  Innovation,
  InstitutionProfile,
  LocalStats,
  MatchResults,
  MunicipalityFacts,
  Notification,
  PersonaId,
  ProblemCard,
  ProblemInput,
  QueueFilter,
  QueuePage,
  ReasonSegment,
  RedactionResult,
  SubmittedCase,
  Trends,
} from './types';

export interface HubApi {
  redactDescription(
    text: string,
    signal?: AbortSignal,
  ): Promise<RedactionResult>;
  summariseProblem(
    input: ProblemInput,
    signal?: AbortSignal,
  ): Promise<ProblemCard>;
  findMatches(card: ProblemCard, signal?: AbortSignal): Promise<MatchResults>;
  getMatchReason(
    innovationId: string,
    signal?: AbortSignal,
  ): Promise<readonly ReasonSegment[]>;
  getLocalStats(municipality: string, signal?: AbortSignal): Promise<LocalStats>;
  getInnovation(id: string, signal?: AbortSignal): Promise<Innovation>;
  getMunicipalityFacts(
    municipality: string,
    signal?: AbortSignal,
  ): Promise<MunicipalityFacts>;
  draftService(
    innovationId: string,
    profile: InstitutionProfile,
    signal?: AbortSignal,
  ): AsyncIterable<DraftSection>;
  submitIdea(
    idea: IdeaForm,
    author: PersonaId | null,
    signal?: AbortSignal,
  ): Promise<SubmittedCase>;
  listMyCases(
    persona: PersonaId,
    signal?: AbortSignal,
  ): Promise<readonly CaseSummary[]>;
  getCase(id: string, signal?: AbortSignal): Promise<CaseThread>;
  sendMessage(
    caseId: string,
    from: PersonaId,
    text: string,
    signal?: AbortSignal,
  ): Promise<CaseThread>;
  listNotifications(
    persona: PersonaId,
    signal?: AbortSignal,
  ): Promise<readonly Notification[]>;
  markAllRead(persona: PersonaId, signal?: AbortSignal): Promise<void>;
  /**
   * Calls `onNew` for every notification created for `persona` since their
   * last subscription ended, then for each new one. Returns an unsubscribe.
   */
  subscribeToNotifications(
    persona: PersonaId,
    onNew: (notification: Notification) => void,
  ): () => void;
  listQueue(filter: QueueFilter, signal?: AbortSignal): Promise<QueuePage>;
  getTrends(signal?: AbortSignal): Promise<Trends>;
}
```

`src/api/personas.ts`:

```ts
import type { Persona, PersonaId } from './types';

export const PERSONAS: Readonly<Record<PersonaId, Persona>> = {
  ewa: {
    id: 'ewa',
    name: 'Ewa W.',
    initials: 'EW',
    role: 'user',
    description: 'Pracownica GOPS',
    threadRole: 'Pracownica GOPS',
  },
  maria: {
    id: 'maria',
    name: 'Maria N.',
    initials: 'MN',
    role: 'user',
    description: 'Autorka pomysłu',
    threadRole: 'Autorka pomysłu',
  },
  anna: {
    id: 'anna',
    name: 'Anna Kowalczyk',
    initials: 'AK',
    role: 'curator',
    description: 'Kuratorka ROPS',
    threadRole: 'ROPS',
  },
};

export const PERSONA_IDS: readonly PersonaId[] = ['ewa', 'maria', 'anna'];
```

- [ ] **Step 3: Write the failing date tests**

`src/api/mock/dates.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { addDays, dayMonth, dayMonthTime, longDate } from './dates';

const date: Date = new Date(2026, 9, 3, 8, 5);

describe('dates', (): void => {
  it('formats day and month', (): void => {
    expect(dayMonth(date)).toBe('03.10');
  });

  it('formats day, month and time', (): void => {
    expect(dayMonthTime(date)).toBe('03.10, 08:05');
  });

  it('formats a long Polish date', (): void => {
    expect(longDate(addDays(date, 18))).toBe('21 października 2026');
  });
});
```

Run: `npx vitest run src/api/mock/dates.test.ts` — Expected: FAIL, module not found.

- [ ] **Step 4: Implement the date helpers**

`src/api/mock/dates.ts`:

```ts
const MONTHS: readonly string[] = [
  'stycznia',
  'lutego',
  'marca',
  'kwietnia',
  'maja',
  'czerwca',
  'lipca',
  'sierpnia',
  'września',
  'października',
  'listopada',
  'grudnia',
];

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function dayMonth(date: Date): string {
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}`;
}

export function dayMonthTime(date: Date): string {
  return `${dayMonth(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function longDate(date: Date): string {
  const month: string = MONTHS[date.getMonth()] ?? '';
  return `${String(date.getDate())} ${month} ${String(date.getFullYear())}`;
}

export function addDays(date: Date, days: number): Date {
  const result: Date = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

Run the test again — Expected: PASS.

- [ ] **Step 5: Write the seed data for cases and notifications**

`src/api/mock/data/cases.ts`:

```ts
import type {
  CaseStatus,
  CaseTimeline,
  CaseType,
  Message,
  Notification,
  PersonaId,
} from '../../types';

export interface StoredCase {
  id: string;
  type: CaseType;
  title: string;
  area: string;
  place: string;
  date: string;
  status: CaseStatus;
  expert: string | null;
  flagged: boolean;
  authorId: PersonaId | null;
  stage: string | null;
  timeline: CaseTimeline;
  messages: Message[];
}

/** Totals drawn in the A2 heading; the nine seeded rows are its first page. */
export const QUEUE_BASE: {
  readonly total: number;
  readonly fresh: number;
  readonly overdue: number;
} = { total: 38, fresh: 12, overdue: 4 };

function placeholderMessage(id: string, date: string): Message {
  return {
    id: `${id}-m1`,
    from: null,
    authorName: 'Zgłaszający',
    initials: 'Z',
    role: 'Zgłaszający',
    time: `${date}, 09:00`,
    text: 'Zgłoszenie przykładowe.',
  };
}

function seedCase(
  number: string,
  type: CaseType,
  title: string,
  area: string,
  place: string,
  date: string,
  status: CaseStatus,
  expert: string | null,
  flagged: boolean,
  authorId: PersonaId | null,
): StoredCase {
  const id: string = `HUB-2026-${number}`;
  return {
    id,
    type,
    title,
    area,
    place,
    date,
    status,
    expert,
    flagged,
    authorId,
    stage: null,
    timeline: {
      sent: date,
      inProgress: status === 'Nowe' || status === 'Ponad 48 h' ? null : date,
      answered: status === 'Odpowiedziano' ? date : null,
      closed: null,
    },
    messages: [placeholderMessage(id, date)],
  };
}

function kawiarenka(): StoredCase {
  return {
    id: 'HUB-2026-0142',
    type: 'Pomysł',
    title: 'Sąsiedzka kawiarenka',
    area: 'Seniorzy',
    place: 'pow. tarnowski',
    date: '03.10',
    status: 'Odpowiedziano',
    expert: 'dr P. Nowak',
    flagged: false,
    authorId: 'maria',
    stage: 'Prototyp',
    timeline: {
      sent: '03.10',
      inProgress: '06.10',
      answered: '07.10',
      closed: null,
    },
    messages: [
      {
        id: 'HUB-2026-0142-m1',
        from: 'maria',
        authorName: 'Maria N.',
        initials: 'MN',
        role: 'Autorka pomysłu',
        time: '03.10, 18:20',
        text: 'Wysyłam fiszkę. Mamy już 6 chętnych seniorów i dwoje licealistów.',
      },
      {
        id: 'HUB-2026-0142-m2',
        from: 'anna',
        authorName: 'Anna Kowalczyk',
        initials: 'AK',
        role: 'ROPS',
        time: '07.10, 10:05',
        text: 'Dziękujemy! Pomysł pasuje do naboru „Usługa Wrażliwa”. Proponujemy rozmowę z ekspertem o finansowaniu.',
      },
      {
        id: 'HUB-2026-0142-m3',
        from: null,
        authorName: 'dr Piotr Nowak',
        initials: 'PN',
        role: 'Ekspert',
        time: '07.10, 12:40',
        text: 'Warto sprawdzić, czy remiza OSP może udostępniać salę bezpłatnie. To obniży koszty o połowę.',
      },
    ],
  };
}

export function seedCases(): StoredCase[] {
  return [
    kawiarenka(),
    seedCase('0141', 'Potrzeba', 'Samotni seniorzy bez dojazdu do miasta', 'Seniorzy', 'Jodłowa Wola', '03.10', 'Nowe', null, true, 'ewa'),
    seedCase('0140', 'Potrzeba', 'Brak wsparcia dla opiekunów osób zależnych', 'Opiekunowie', 'pow. limanowski', '02.10', 'Nowe', null, true, null),
    seedCase('0139', 'Zapytanie', 'Koszty startu: Mobilna Kawiarenka Seniora', 'Seniorzy', 'pow. gorlicki', '01.10', 'W trakcie', 'dr P. Nowak', false, null),
    seedCase('0138', 'Do testów', 'Cyfrowy Wnuk — zgłoszenie testera', 'Wykluczenie cyfrowe', 'pow. nowotarski', '30.09', 'Odpowiedziano', 'M. Wójcik', false, 'maria'),
    seedCase('0137', 'Opinia', 'Telefony Życzliwości — „4 – pomogło”', 'Seniorzy', 'Kraków', '29.09', 'Odpowiedziano', null, false, null),
    seedCase('0136', 'Potrzeba', 'Młodzież nie ma miejsca spotkań po szkole', 'Młodzież', 'pow. olkuski', '27.09', 'Ponad 48 h', null, false, null),
    seedCase('0135', 'Pomysł', 'Wiejska biblioteka rzeczy', 'Społeczność lokalna', 'pow. miechowski', '26.09', 'Ponad 48 h', 'K. Zając', false, null),
    seedCase('0134', 'Potrzeba', 'Kryzys psychiczny u nastolatków, długie kolejki', 'Zdrowie psychiczne', 'pow. oświęcimski', '25.09', 'W trakcie', 'dr A. Lis', true, null),
  ];
}

export function seedNotifications(): Map<PersonaId, Notification[]> {
  return new Map<PersonaId, Notification[]>([
    [
      'maria',
      [
        { id: 'n1', icon: '↩', text: 'ROPS odpowiedział na Twój pomysł »Sąsiedzka kawiarenka«', type: 'Odpowiedź', time: '2 min temu', unread: true, caseId: 'HUB-2026-0142' },
        { id: 'n2', icon: '◎', text: 'Twoje zgłoszenie do testów »Cyfrowy Wnuk« zostało przyjęte', type: 'Testy', time: '1 godz. temu', unread: true, caseId: 'HUB-2026-0138' },
        { id: 'n3', icon: '◷', text: 'Nowy nabór w obszarze „Seniorzy”: Usługa Wrażliwa, do 30.11', type: 'Nabór', time: 'wczoraj', unread: true, caseId: null },
        { id: 'n4', icon: '★', text: 'Autor innowacji podziękował za Twoją opinię', type: 'Opinia', time: '3 dni temu', unread: false, caseId: null },
      ],
    ],
    [
      'ewa',
      [
        { id: 'n5', icon: '◷', text: 'Nowy nabór w obszarze „Seniorzy”: Usługa Wrażliwa, do 30.11', type: 'Nabór', time: 'wczoraj', unread: true, caseId: null },
      ],
    ],
    ['anna', []],
  ]);
}
```

Note: the A2 mockup draws "Sąsiedzka kawiarenka" as "Nowe" while the C3
mockup draws the same case as "Odpowiedziano" with replies. The seed uses the
C3 state so the queue and the thread agree.

- [ ] **Step 6: Write the failing store tests**

`src/api/mock/store.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import type {
  CaseThread,
  IdeaForm,
  Notification,
  QueuePage,
  SubmittedCase,
} from '../types';
import { createStore, type Store } from './store';

const idea: IdeaForm = {
  name: 'Wiejski klub filmowy',
  summary: 'Raz w miesiącu kino w świetlicy.',
  audience: 'Mieszkańcy wsi',
  problem: 'Brak kultury na miejscu',
  stage: 'Pomysł',
  email: '',
};

function fixedNow(): Date {
  return new Date(2026, 9, 14, 9, 30);
}

describe('store', (): void => {
  it('seeds the queue with the example rows and totals', (): void => {
    const store: Store = createStore(fixedNow);
    const page: QueuePage = store.listQueue({ type: null });
    expect(page.rows).toHaveLength(9);
    expect(page.rows[0]?.title).toBe('Sąsiedzka kawiarenka');
    expect(page).toMatchObject({ total: 38, open: 38, fresh: 12, overdue: 4 });
  });

  it('filters the queue by type', (): void => {
    const store: Store = createStore(fixedNow);
    const page: QueuePage = store.listQueue({ type: 'Pomysł' });
    expect(page.rows.map((row) => row.title)).toEqual([
      'Sąsiedzka kawiarenka',
      'Wiejska biblioteka rzeczy',
    ]);
  });

  it('creates a case from an idea, first in the queue and in the author list', (): void => {
    const store: Store = createStore(fixedNow);
    const submitted: SubmittedCase = store.submitIdea(idea, 'maria');
    expect(submitted).toEqual({
      id: 'HUB-2026-0143',
      title: 'Wiejski klub filmowy',
      replyBy: '21 października 2026',
    });
    const page: QueuePage = store.listQueue({ type: null });
    expect(page.rows[0]).toMatchObject({
      id: 'HUB-2026-0143',
      type: 'Pomysł',
      status: 'Nowe',
      date: '14.10',
    });
    expect(page).toMatchObject({ total: 39, open: 39, fresh: 13 });
    expect(store.listMyCases('maria').map((item) => item.id)).toContain(
      'HUB-2026-0143',
    );
    expect(store.getCase('HUB-2026-0143').messages[0]?.text).toBe(
      'Raz w miesiącu kino w świetlicy.',
    );
  });

  it('numbers anonymous ideas too, without listing them for anyone', (): void => {
    const store: Store = createStore(fixedNow);
    store.submitIdea(idea, null);
    expect(store.listMyCases('maria')).toHaveLength(2);
    expect(store.getCase('HUB-2026-0143').authorId).toBeNull();
  });

  it('marks a case answered and notifies the author when the curator replies', (): void => {
    const store: Store = createStore(fixedNow);
    store.submitIdea(idea, 'maria');
    const before: number = store.listNotifications('maria').length;
    const thread: CaseThread = store.sendMessage(
      'HUB-2026-0143',
      'anna',
      'Dziękujemy za pomysł.',
    );
    expect(thread.status).toBe('Odpowiedziano');
    expect(thread.timeline.answered).toBe('14.10');
    expect(thread.messages.at(-1)).toMatchObject({
      from: 'anna',
      role: 'ROPS',
      time: '14.10, 09:30',
      text: 'Dziękujemy za pomysł.',
    });
    const after: readonly Notification[] = store.listNotifications('maria');
    expect(after).toHaveLength(before + 1);
    expect(after[0]).toMatchObject({
      unread: true,
      caseId: 'HUB-2026-0143',
      text: 'ROPS odpowiedział na Twój pomysł »Wiejski klub filmowy«',
    });
  });

  it('creates no notification when the author writes', (): void => {
    const store: Store = createStore(fixedNow);
    const before: number = store.listNotifications('maria').length;
    const thread: CaseThread = store.sendMessage(
      'HUB-2026-0142',
      'maria',
      'Mamy zgodę OSP.',
    );
    expect(thread.status).toBe('Odpowiedziano');
    expect(store.listNotifications('maria')).toHaveLength(before);
    expect(store.listNotifications('anna')).toHaveLength(0);
  });

  it('queues notifications until the author subscribes, then delivers live', (): void => {
    const store: Store = createStore(fixedNow);
    const received: string[] = [];
    store.sendMessage('HUB-2026-0142', 'anna', 'Pierwsza.');
    const unsubscribe: () => void = store.subscribe(
      'maria',
      (notification: Notification): void => {
        received.push(notification.id);
      },
    );
    expect(received).toHaveLength(1);
    store.sendMessage('HUB-2026-0142', 'anna', 'Druga.');
    expect(received).toHaveLength(2);
    unsubscribe();
    store.sendMessage('HUB-2026-0142', 'anna', 'Trzecia.');
    expect(received).toHaveLength(2);
  });

  it('marks all notifications read', (): void => {
    const store: Store = createStore(fixedNow);
    store.markAllRead('maria');
    expect(
      store.listNotifications('maria').every((item) => !item.unread),
    ).toBe(true);
  });

  it('throws for an unknown case', (): void => {
    const store: Store = createStore(fixedNow);
    expect((): CaseThread => store.getCase('HUB-0000')).toThrow(
      'Nie znaleziono zgłoszenia.',
    );
  });
});
```

The inline callbacks `(row) => row.title` are inside `expect` arguments; if
the linter requires annotations there, write them as
`(row: QueueRow): string => row.title` and import the type.

Run: `npx vitest run src/api/mock/store.test.ts` — Expected: FAIL, `./store` not found.

- [ ] **Step 7: Implement the store**

`src/api/mock/store.ts`:

```ts
import { PERSONAS } from '../personas';
import type {
  CaseSummary,
  CaseThread,
  IdeaForm,
  Message,
  Notification,
  PersonaId,
  QueueFilter,
  QueuePage,
  QueueRow,
  SubmittedCase,
} from '../types';
import {
  QUEUE_BASE,
  seedCases,
  seedNotifications,
  type StoredCase,
} from './data/cases';
import { addDays, dayMonth, dayMonthTime, longDate } from './dates';

type Listener = (notification: Notification) => void;

export interface Store {
  submitIdea(idea: IdeaForm, author: PersonaId | null): SubmittedCase;
  listMyCases(persona: PersonaId): readonly CaseSummary[];
  getCase(id: string): CaseThread;
  sendMessage(caseId: string, from: PersonaId, text: string): CaseThread;
  listQueue(filter: QueueFilter): QueuePage;
  listNotifications(persona: PersonaId): readonly Notification[];
  markAllRead(persona: PersonaId): void;
  subscribe(persona: PersonaId, onNew: Listener): () => void;
}

const REPLY_DAYS: number = 7;

function toThread(stored: StoredCase): CaseThread {
  return {
    id: stored.id,
    type: stored.type,
    title: stored.title,
    status: stored.status,
    authorId: stored.authorId,
    area: stored.area,
    place: stored.place,
    stage: stored.stage,
    expert: stored.expert,
    timeline: { ...stored.timeline },
    messages: [...stored.messages],
  };
}

function toRow(stored: StoredCase): QueueRow {
  return {
    id: stored.id,
    type: stored.type,
    title: stored.title,
    area: stored.area,
    place: stored.place,
    date: stored.date,
    status: stored.status,
    expert: stored.expert,
    flagged: stored.flagged,
  };
}

export function createStore(now: () => Date = (): Date => new Date()): Store {
  const cases: StoredCase[] = seedCases();
  const notifications: Map<PersonaId, Notification[]> = seedNotifications();
  const pending: Map<PersonaId, Notification[]> = new Map<
    PersonaId,
    Notification[]
  >();
  const listeners: Map<PersonaId, Set<Listener>> = new Map<
    PersonaId,
    Set<Listener>
  >();
  let nextCaseNumber: number = 143;
  let nextNotification: number = 100;
  let added: number = 0;

  function find(id: string): StoredCase {
    const found: StoredCase | undefined = cases.find(
      (item: StoredCase): boolean => item.id === id,
    );
    if (found === undefined) {
      throw new Error('Nie znaleziono zgłoszenia.');
    }
    return found;
  }

  function notify(persona: PersonaId, notification: Notification): void {
    const list: Notification[] = notifications.get(persona) ?? [];
    notifications.set(persona, [notification, ...list]);
    const active: Set<Listener> | undefined = listeners.get(persona);
    if (active !== undefined && active.size > 0) {
      for (const listener of active) {
        listener(notification);
      }
      return;
    }
    pending.set(persona, [...(pending.get(persona) ?? []), notification]);
  }

  return {
    submitIdea(idea: IdeaForm, author: PersonaId | null): SubmittedCase {
      const date: Date = now();
      const id: string = `HUB-2026-${String(nextCaseNumber).padStart(4, '0')}`;
      nextCaseNumber += 1;
      added += 1;
      const first: Message = {
        id: `${id}-m1`,
        from: author,
        authorName: author === null ? 'Zgłaszający' : PERSONAS[author].name,
        initials: author === null ? 'Z' : PERSONAS[author].initials,
        role: author === null ? 'Zgłaszający' : PERSONAS[author].threadRole,
        time: dayMonthTime(date),
        text: idea.summary,
      };
      cases.unshift({
        id,
        type: 'Pomysł',
        title: idea.name,
        area: idea.audience,
        place: 'nie podano',
        date: dayMonth(date),
        status: 'Nowe',
        expert: null,
        flagged: false,
        authorId: author,
        stage: idea.stage,
        timeline: {
          sent: dayMonth(date),
          inProgress: null,
          answered: null,
          closed: null,
        },
        messages: [first],
      });
      return {
        id,
        title: idea.name,
        replyBy: longDate(addDays(date, REPLY_DAYS)),
      };
    },

    listMyCases(persona: PersonaId): readonly CaseSummary[] {
      return cases
        .filter((item: StoredCase): boolean => item.authorId === persona)
        .map(
          (item: StoredCase): CaseSummary => ({
            id: item.id,
            type: item.type,
            title: item.title,
            status: item.status,
          }),
        );
    },

    getCase(id: string): CaseThread {
      return toThread(find(id));
    },

    sendMessage(caseId: string, from: PersonaId, text: string): CaseThread {
      const stored: StoredCase = find(caseId);
      const date: Date = now();
      stored.messages.push({
        id: `${caseId}-m${String(stored.messages.length + 1)}`,
        from,
        authorName: PERSONAS[from].name,
        initials: PERSONAS[from].initials,
        role: PERSONAS[from].threadRole,
        time: dayMonthTime(date),
        text,
      });
      if (PERSONAS[from].role === 'curator') {
        stored.status = 'Odpowiedziano';
        stored.timeline = {
          ...stored.timeline,
          inProgress: stored.timeline.inProgress ?? dayMonth(date),
          answered: dayMonth(date),
        };
        if (stored.authorId !== null) {
          nextNotification += 1;
          const subject: string =
            stored.type === 'Pomysł' ? 'Twój pomysł' : 'Twoje zgłoszenie';
          notify(stored.authorId, {
            id: `n${String(nextNotification)}`,
            icon: '↩',
            text: `ROPS odpowiedział na ${subject} »${stored.title}«`,
            type: 'Odpowiedź',
            time: 'przed chwilą',
            unread: true,
            caseId,
          });
        }
      }
      return toThread(stored);
    },

    listQueue(filter: QueueFilter): QueuePage {
      const rows: QueueRow[] = cases
        .filter(
          (item: StoredCase): boolean =>
            filter.type === null || item.type === filter.type,
        )
        .map(toRow);
      return {
        rows,
        total: QUEUE_BASE.total + added,
        open: QUEUE_BASE.total + added,
        fresh: QUEUE_BASE.fresh + added,
        overdue: QUEUE_BASE.overdue,
      };
    },

    listNotifications(persona: PersonaId): readonly Notification[] {
      return [...(notifications.get(persona) ?? [])];
    },

    markAllRead(persona: PersonaId): void {
      notifications.set(
        persona,
        (notifications.get(persona) ?? []).map(
          (item: Notification): Notification => ({ ...item, unread: false }),
        ),
      );
    },

    subscribe(persona: PersonaId, onNew: Listener): () => void {
      const queued: Notification[] = pending.get(persona) ?? [];
      pending.delete(persona);
      for (const notification of queued) {
        onNew(notification);
      }
      const active: Set<Listener> = listeners.get(persona) ?? new Set<Listener>();
      active.add(onNew);
      listeners.set(persona, active);
      return (): void => {
        active.delete(onNew);
      };
    },
  };
}
```

- [ ] **Step 8: Run the tests**

Run: `npx vitest run src/api/mock` — Expected: PASS (dates 3, store 9).

- [ ] **Step 9: Commit**

```bash
npm run format && npm run check
git add -A frontend/src/api
git commit -m "feat: add domain types, personas and the in-memory case store"
```

---

### Task 4: Example data and the mock API

**Files:**
- Create: `src/api/examples.ts`, `src/api/mock/data/matchmaking.ts`, `src/api/mock/data/innovations.ts`, `src/api/mock/data/adaptation.ts`, `src/api/mock/data/trends.ts`, `src/api/mock/createMockApi.ts`
- Test: `src/api/mock/createMockApi.test.ts`

**Interfaces:**
- Consumes: `HubApi`, all types, `createStore` (Task 3).
- Produces: `createMockApi(options?: MockApiOptions): HubApi` where `MockApiOptions = { delayMs?: number; isOnline?: () => boolean; now?: () => Date }`; and from `api/examples.ts`: `EXAMPLE_DESCRIPTION`, `EXAMPLE_MUNICIPALITY`, `EXAMPLE_PROMPTS`, `EXAMPLE_IDEA`, `EXAMPLE_PROFILE`, `BUDGET_OPTIONS`, `RESOURCE_OPTIONS`, `IDEA_STAGES`.

- [ ] **Step 1: Write the shared example defaults**

These are form defaults that screens pre-fill, so they live outside `mock/`.

`src/api/examples.ts`:

```ts
import type { IdeaForm, IdeaStage } from './types';

export const EXAMPLE_DESCRIPTION: string =
  'W naszej gminie wielu starszych ludzi mieszka samotnie, dzieci wyjechały do pracy za granicę. Pani Janina z Jodłowej Woli (tel. 600 123 456) od zawału prawie nie wychodzi z domu, a jej syn Marek jest w Niemczech. Nie ma transportu do miasta i poza listonoszem nikt ich nie odwiedza.';

export const EXAMPLE_MUNICIPALITY: string = 'Jodłowa Wola, pow. tarnowski';

export const EXAMPLE_PROMPTS: readonly string[] = [
  'Starsi sąsiedzi mieszkają sami i nie mają z kim porozmawiać',
  'Młodzież po szkole nie ma gdzie się spotykać',
  'Rodzice dzieci z niepełnosprawnością nie mają chwili wytchnienia',
];

export const IDEA_STAGES: readonly IdeaStage[] = [
  'Pomysł',
  'Prototyp',
  'Testowane w mikroskali',
  'Działa',
];

export const EXAMPLE_IDEA: IdeaForm = {
  name: 'Sąsiedzka kawiarenka',
  summary:
    'Raz w tygodniu w remizie seniorzy i młodzi piją kawę i uczą się od siebie nawzajem.',
  audience: 'Seniorzy i młodzież ze wsi',
  problem: 'Samotność, brak miejsc spotkań',
  stage: 'Prototyp',
  email: 'm.nowak@przyklad.pl',
};

export const BUDGET_OPTIONS: readonly string[] = [
  'do 10 tys. zł',
  '10–30 tys. zł',
  '30–60 tys. zł',
  'ponad 60 tys. zł',
  'Nie wiem',
];

export const RESOURCE_OPTIONS: readonly string[] = [
  'Lokal (świetlica)',
  'Transport',
  'KGW',
  'OSP',
  'Parafia',
  'Szkoła',
];

/** Form values as strings, as the MW1 form holds them. */
export interface ProfileDraft {
  readonly municipality: string;
  readonly audience: string;
  readonly recipients: string;
  readonly budget: string;
  readonly staff: string;
  readonly resources: readonly string[];
}

export const EXAMPLE_PROFILE: ProfileDraft = {
  municipality: 'Jodłowa Wola',
  audience: 'Seniorzy 65+ mieszkający samotnie',
  recipients: '40',
  budget: '10–30 tys. zł',
  staff: '1 pracownik socjalny na część etatu, asystent rodziny',
  resources: ['Lokal (świetlica)', 'KGW', 'OSP', 'Szkoła'],
};
```

- [ ] **Step 2: Write the matchmaking data**

`src/api/mock/data/matchmaking.ts`:

```ts
import type {
  LocalStats,
  MatchResults,
  ProblemCard,
  ReasonSegment,
  RedactionResult,
} from '../../types';

export const exampleRedaction: RedactionResult = {
  segments: [
    { kind: 'text', text: 'W naszej gminie wielu starszych ludzi mieszka samotnie, dzieci wyjechały do pracy za granicę. ' },
    { kind: 'replacement', replacementId: 'osoba-a' },
    { kind: 'text', text: ' z ' },
    { kind: 'replacement', replacementId: 'miejscowosc' },
    { kind: 'text', text: ' (tel. ' },
    { kind: 'replacement', replacementId: 'telefon' },
    { kind: 'text', text: ') ' },
    { kind: 'replacement', replacementId: 'zdrowie' },
    { kind: 'text', text: ' prawie nie wychodzi z domu, a ' },
    { kind: 'replacement', replacementId: 'osoba-b' },
    { kind: 'text', text: ' jest w Niemczech. Nie ma transportu do miasta i poza listonoszem nikt ich nie odwiedza.' },
  ],
  replacements: [
    { id: 'osoba-a', icon: '●', tag: 'OSOBA_A', inlineLabel: 'OSOBA_A', kind: 'Imię osoby', original: 'Pani Janina', restorable: true },
    { id: 'miejscowosc', icon: '◆', tag: 'MIEJSCOWOŚĆ', inlineLabel: 'MIEJSCOWOŚĆ', kind: 'Nazwa wsi', original: 'Jodłowej Woli', restorable: true },
    { id: 'telefon', icon: '☎', tag: 'TELEFON', inlineLabel: 'TELEFON', kind: 'Numer telefonu', original: '600 123 456', restorable: true },
    { id: 'zdrowie', icon: '✚', tag: 'ZDROWIE', inlineLabel: 'INFORMACJA O ZDROWIU USUNIĘTA', kind: 'Informacja o chorobie', original: 'od zawału', restorable: false },
    { id: 'osoba-b', icon: '●', tag: 'OSOBA_B', inlineLabel: 'OSOBA_B', kind: 'Imię członka rodziny', original: 'jej syn Marek', restorable: true },
  ],
};

export const exampleProblemCard: ProblemCard = {
  summary:
    'w Twojej wiejskiej gminie starsze osoby mieszkają same, bo rodziny wyjechały. Brakuje im kontaktu z innymi ludźmi i dojazdu do miasta. Szukasz rozwiązania, które może wdrożyć gmina albo GOPS.',
  groups: [
    { id: 'grupa', label: 'Grupa docelowa', chips: ['seniorzy 65+'] },
    { id: 'problem', label: 'Problem', chips: ['samotność', 'brak transportu'] },
    { id: 'gmina', label: 'Typ gminy', chips: ['wiejska'] },
    { id: 'wdraza', label: 'Kto wdraża', chips: ['GOPS'] },
  ],
  questions: [
    { id: 'kto', title: 'Kto miałby wdrażać?', options: ['GOPS / OPS', 'NGO', 'Gmina z NGO', 'Nie wiem'], suggested: 'Gmina z NGO' },
    { id: 'pilne', title: 'Co jest najpilniejsze?', options: ['Kontakt z ludźmi', 'Dojazdy', 'Pomoc w domu'], suggested: 'Kontakt z ludźmi' },
    { id: 'budzet', title: 'Skala budżetu?', options: ['do 10 tys. zł', '10–50 tys. zł', 'ponad 50 tys. zł'], suggested: null },
  ],
};

export const exampleMatches: MatchResults = {
  searchTerms: ['seniorzy 65+', 'samotność', 'brak transportu', 'gmina wiejska'],
  cards: [
    {
      innovationId: 'telefony-zyczliwosci',
      name: 'Sąsiedzkie Telefony Życzliwości',
      category: 'Seniorzy · usługa',
      band: 'strong',
      fit: [
        { label: 'seniorzy', ok: true },
        { label: 'JST + NGO', ok: true },
        { label: 'teren wiejski', ok: true },
      ],
      verified: '05.2026',
      cost: 'ok. 8–15 tys. zł / rok',
    },
    {
      innovationId: 'mobilna-kawiarenka',
      name: 'Mobilna Kawiarenka Seniora',
      category: 'Seniorzy · usługa',
      band: 'strong',
      fit: [
        { label: 'seniorzy', ok: true },
        { label: 'teren wiejski', ok: true },
        { label: 'wymaga busa', ok: false },
      ],
      verified: '02.2026',
      cost: 'ok. 40–60 tys. zł / rok',
    },
    {
      innovationId: 'cyfrowy-wnuk',
      name: 'Cyfrowy Wnuk',
      category: 'Seniorzy · metoda',
      band: 'medium',
      fit: [
        { label: 'seniorzy', ok: true },
        { label: 'NGO', ok: true },
        { label: 'testowane w mieście', ok: false },
      ],
      verified: '11.2025',
      cost: 'ok. 5 tys. zł / edycja',
    },
  ],
  similarCount: 4,
  similar: [
    { quote: 'Starsze osoby we wsiach bez komunikacji publicznej tygodniami nie rozmawiają z nikim poza rodziną przez telefon.', innovationId: 'telefony-zyczliwosci', source: 'Sąsiedzkie Telefony Życzliwości' },
    { quote: 'Dzieci seniorów pracują za granicą, a sąsiedzka pomoc zanikła razem z wiejskim sklepem.', innovationId: 'mobilna-kawiarenka', source: 'Mobilna Kawiarenka Seniora' },
    { quote: 'Seniorzy chcą kontaktu z wnukami, ale nie umieją obsługiwać komunikatorów.', innovationId: 'cyfrowy-wnuk', source: 'Cyfrowy Wnuk' },
  ],
};

/** `*like this*` marks a highlighted fragment, as in the mockup script. */
function segments(text: string): readonly ReasonSegment[] {
  return text
    .split('*')
    .map(
      (part: string, index: number): ReasonSegment => ({
        text: part,
        highlight: index % 2 === 1,
      }),
    )
    .filter((segment: ReasonSegment): boolean => segment.text !== '');
}

export const exampleReasons: Readonly<
  Record<string, readonly ReasonSegment[]>
> = {
  'telefony-zyczliwosci': segments(
    'Odpowiada na *samotność* osób starszych w *małych miejscowościach*. Wolontariusze dzwonią codziennie, więc *nie potrzeba transportu*. Może prowadzić *GOPS z NGO*.',
  ),
  'mobilna-kawiarenka': segments(
    'Spotkania przyjeżdżają *do wsi*, więc rozwiązuje *brak dojazdu*. Daje *kontakt z ludźmi* raz w tygodniu.',
  ),
  'cyfrowy-wnuk': segments(
    'Młodzież uczy seniorów *rozmów wideo z rodziną za granicą*. Testowane głównie w mieście, wymaga dostępu do internetu.',
  ),
};

export const exampleLocalStats: LocalStats = {
  source: 'Źródło: GUS, Bank Danych Lokalnych, 2024 · dane przykładowe',
  stats: [
    {
      label: 'Osoby 65+ mieszkające samotnie',
      max: 16,
      rows: [
        { who: 'Gmina', value: 14, primary: true },
        { who: 'Powiat', value: 11, primary: false },
        { who: 'Województwo', value: 10, primary: false },
      ],
    },
    {
      label: 'Odsetek mieszkańców w wieku 65+',
      max: 26,
      rows: [
        { who: 'Gmina', value: 23, primary: true },
        { who: 'Powiat', value: 19, primary: false },
        { who: 'Województwo', value: 19, primary: false },
      ],
    },
  ],
};
```

- [ ] **Step 3: Write the innovation, adaptation and trends data**

`src/api/mock/data/innovations.ts`:

```ts
import type { Innovation } from '../../types';

const telefony: Innovation = {
  id: 'telefony-zyczliwosci',
  name: 'Sąsiedzkie Telefony Życzliwości',
  category: 'Seniorzy · usługa',
  verified: '05.2026',
  cost: 'ok. 8–15 tys. zł / rok',
  seeksTesters: true,
  hasVideo: true,
  author: 'Stowarzyszenie Dobry Sąsiad',
  incubator: 'Inkubator Innowacji Społecznych „Most”',
  rating: '4,6',
  reviewCount: 12,
  testerNote: 'Zostało 6 miejsc dla testerów · do 30.11.2026',
  facts: [
    { label: 'Problem', value: 'Samotność i brak codziennego kontaktu u osób starszych, zwłaszcza w małych miejscowościach.' },
    { label: 'Grupa docelowa', value: 'Seniorzy 65+ mieszkający samotnie.' },
    { label: 'Kto może skorzystać', value: 'OPS/GOPS, organizacje pozarządowe, parafie, kluby seniora.' },
    { label: 'Składowe', value: 'Grafik codziennych rozmów, wolontariusze, koordynator, szkolenie, procedura na sytuacje niepokojące.' },
    { label: 'Koszt i kadra', value: 'Ok. 8–15 tys. zł rocznie. Koordynator na 1/4 etatu i 6–10 wolontariuszy.' },
    { label: 'Jak skorzystać', value: 'Pobierz podręcznik, wyznacz koordynatora, zgłoś się do autora po bezpłatne szkolenie online.' },
  ],
  materials: [
    'Podręcznik wdrożenia (PDF, 2,1 MB)',
    'Scenariusz rozmowy (DOCX, 140 KB)',
    'Wzór grafiku wolontariuszy (XLSX, 60 KB)',
  ],
  steps: [
    'Wyznacz w GOPS koordynatora i porozmawiaj z KGW lub parafią o wolontariuszach.',
    'Zrób listę seniorów chętnych do rozmów razem z sołtysami.',
    'Przeprowadź szkolenie wolontariuszy z materiałów autora.',
    'Zacznij od 3 miesięcy pilotażu i zbierz opinie seniorów.',
  ],
  fundingProgrammes: [
    'FERS – usługi społeczne',
    'Małopolska dla Seniorów (przykład)',
  ],
  fundingNote:
    'Sprawdzono 05.2026. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    { heading: '5 – bardzo pomogło · GOPS, gmina wiejska', quote: 'Ruszyliśmy w miesiąc. Seniorzy czekają na telefon jak na wizytę.' },
    { heading: '4 – pomogło · NGO, miasto', quote: 'Warto od razu zaplanować szkolenie wolontariuszy.' },
  ],
};

export const innovations: Readonly<Record<string, Innovation>> = {
  [telefony.id]: telefony,
  'mobilna-kawiarenka': {
    ...telefony,
    id: 'mobilna-kawiarenka',
    name: 'Mobilna Kawiarenka Seniora',
    category: 'Seniorzy · usługa',
    verified: '02.2026',
    cost: 'ok. 40–60 tys. zł / rok',
    seeksTesters: false,
  },
  'cyfrowy-wnuk': {
    ...telefony,
    id: 'cyfrowy-wnuk',
    name: 'Cyfrowy Wnuk',
    category: 'Seniorzy · metoda',
    verified: '11.2025',
    cost: 'ok. 5 tys. zł / edycja',
    seeksTesters: false,
  },
};
```

`src/api/mock/data/adaptation.ts`:

```ts
import type { DraftSection, MunicipalityFacts } from '../../types';

export const exampleFacts: MunicipalityFacts = {
  title: 'Gmina Jodłowa Wola w liczbach',
  rows: [
    { label: 'Mieszkańcy 65+', value: '1 240' },
    { label: '65+ mieszkający samotnie', value: '14%' },
    { label: 'Sołectwa', value: '11' },
  ],
  source: 'GUS BDL, 2024 · dane przykładowe',
};

export const exampleDraft: readonly DraftSection[] = [
  { id: 'zakres', heading: 'Zakres usługi', kind: 'text', text: 'Codzienne, 10–15-minutowe rozmowy telefoniczne wolontariuszy z samotnymi seniorami oraz spotkanie w świetlicy raz w miesiącu.' },
  { id: 'odbiorcy', heading: 'Odbiorcy', kind: 'text', text: 'Około 40 osób 65+ mieszkających samotnie w 11 sołectwach, wskazanych przez GOPS i sołtysów.' },
  { id: 'kadra', heading: 'Kadra', kind: 'text', text: 'Koordynator z GOPS (1/4 etatu), 8 wolontariuszy z KGW, OSP i szkoły średniej; superwizja raz w miesiącu.' },
  {
    id: 'harmonogram',
    heading: 'Harmonogram',
    kind: 'schedule',
    months: ['I', 'II', 'III', 'IV', 'V', 'VI'],
    rows: [
      { label: 'Rekrutacja wolontariuszy', from: 1, to: 2, tone: 'prepare' },
      { label: 'Szkolenie', from: 2, to: 2, tone: 'prepare' },
      { label: 'Pilotaż rozmów', from: 3, to: 5, tone: 'run' },
      { label: 'Ewaluacja', from: 6, to: 6, tone: 'review' },
    ],
  },
  {
    id: 'koszty',
    heading: 'Koszty (widełki na rok)',
    kind: 'costs',
    rows: [
      { label: 'Koordynator (1/4 etatu)', value: '6–9 tys. zł' },
      { label: 'Szkolenia i superwizja', value: '2–3 tys. zł' },
      { label: 'Telefony, abonamenty', value: '1–2 tys. zł' },
    ],
    total: '9–14 tys. zł',
  },
  { id: 'ryzyka', heading: 'Ryzyka', kind: 'text', text: 'Zbyt mało wolontariuszy w małych sołectwach · rezygnacja seniorów po 1–2 rozmowach · brak procedury, gdy senior nie odbiera.' },
];
```

`src/api/mock/data/trends.ts`:

```ts
import type { DistrictTile, Trends } from '../../types';

function tile(
  name: string,
  abbr: string,
  row: number,
  col: number,
  value: number,
): DistrictTile {
  return { name, abbr, row, col, value };
}

export const exampleTrends: Trends = {
  months: ['IV', 'V', 'VI', 'VII', 'VIII', 'IX'],
  areas: [
    { area: 'Samotność', values: [18, 21, 22, 26, 29, 34] },
    { area: 'Zdrowie psychiczne', values: [14, 15, 19, 18, 22, 25] },
    { area: 'Wykluczenie cyfrowe', values: [16, 14, 15, 12, 13, 11] },
    { area: 'Dostęp do usług', values: [9, 11, 10, 13, 12, 15] },
    { area: 'Opiekunowie', values: [5, 6, 8, 9, 11, 14] },
  ],
  districts: [
    tile('olkuski', 'OLK', 1, 3, 6),
    tile('miechowski', 'MIE', 1, 4, 8),
    tile('chrzanowski', 'CHR', 2, 1, 9),
    tile('krakowski', 'KRK', 2, 2, 24),
    tile('Kraków', 'KR', 2, 3, 38),
    tile('proszowicki', 'PRO', 2, 4, 5),
    tile('dąbrowski', 'DĄB', 2, 5, 7),
    tile('oświęcimski', 'OŚW', 3, 1, 14),
    tile('wadowicki', 'WAD', 3, 2, 12),
    tile('wielicki', 'WIE', 3, 3, 11),
    tile('bocheński', 'BOC', 3, 4, 10),
    tile('brzeski', 'BRZ', 3, 5, 9),
    tile('tarnowski', 'TAR', 3, 6, 27),
    tile('Tarnów', 'TA', 3, 7, 16),
    tile('suski', 'SUS', 4, 2, 8),
    tile('myślenicki', 'MYŚ', 4, 3, 13),
    tile('limanowski', 'LIM', 4, 4, 21),
    tile('nowosądecki', 'NSĄ', 4, 5, 22),
    tile('gorlicki', 'GOR', 4, 6, 18),
    tile('tatrzański', 'TAT', 5, 3, 6),
    tile('nowotarski', 'NTA', 5, 4, 17),
    tile('Nowy Sącz', 'NS', 5, 5, 12),
  ],
  gaps: [
    { title: 'Opieka wytchnieniowa dla rodziców dzieci z niepełnosprawnością na wsi', count: 9, districts: 5, last: '02.10' },
    { title: 'Wsparcie psychiczne dla nastolatków przy długich kolejkach do specjalistów', count: 7, districts: 4, last: '25.09' },
    { title: 'Dowóz seniorów do lekarza w gminach bez komunikacji publicznej', count: 6, districts: 3, last: '30.09' },
  ],
};
```

- [ ] **Step 4: Write the failing mock API tests**

`src/api/mock/createMockApi.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { EXAMPLE_DESCRIPTION } from '../examples';
import type { HubApi } from '../HubApi';
import type {
  DraftSection,
  InstitutionProfile,
  RedactionResult,
} from '../types';
import { createMockApi } from './createMockApi';

const profile: InstitutionProfile = {
  municipality: 'Jodłowa Wola',
  audience: 'Seniorzy',
  recipients: 40,
  budget: '10–30 tys. zł',
  staff: 'Koordynator',
  resources: ['KGW'],
};

describe('createMockApi', (): void => {
  it('returns the five drawn replacements for the example description', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const result: RedactionResult =
      await api.redactDescription(EXAMPLE_DESCRIPTION);
    expect(result.replacements.map((item) => item.tag)).toEqual([
      'OSOBA_A',
      'MIEJSCOWOŚĆ',
      'TELEFON',
      'ZDROWIE',
      'OSOBA_B',
    ]);
  });

  it('returns any other text unchanged with no replacements', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const result: RedactionResult = await api.redactDescription(
      'Brakuje świetlicy dla młodzieży.',
    );
    expect(result).toEqual({
      segments: [{ kind: 'text', text: 'Brakuje świetlicy dla młodzieży.' }],
      replacements: [],
    });
  });

  it('yields the six draft sections in order', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const headings: string[] = [];
    for await (const section of api.draftService(
      'telefony-zyczliwosci',
      profile,
    )) {
      const current: DraftSection = section;
      headings.push(current.heading);
    }
    expect(headings).toEqual([
      'Zakres usługi',
      'Odbiorcy',
      'Kadra',
      'Harmonogram',
      'Koszty (widełki na rok)',
      'Ryzyka',
    ]);
  });

  it('rejects an unknown innovation', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    await expect(api.getInnovation('nope')).rejects.toThrow(
      'Nie znaleziono innowacji.',
    );
  });

  it('rejects sending a message while offline and keeps the thread unchanged', async (): Promise<void> => {
    const api: HubApi = createMockApi({
      delayMs: 0,
      isOnline: (): boolean => false,
    });
    await expect(
      api.sendMessage('HUB-2026-0142', 'maria', 'Halo'),
    ).rejects.toThrow('Brak połączenia.');
    expect((await api.getCase('HUB-2026-0142')).messages).toHaveLength(3);
  });

  it('rejects when the signal is already aborted', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const controller: AbortController = new AbortController();
    controller.abort();
    await expect(api.getTrends(controller.signal)).rejects.toMatchObject({
      name: 'AbortError',
    });
  });

  it('shares one store between calls', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    await api.sendMessage('HUB-2026-0142', 'anna', 'Odpowiedź.');
    expect((await api.listNotifications('maria'))[0]?.caseId).toBe(
      'HUB-2026-0142',
    );
  });
});
```

Run: `npx vitest run src/api/mock/createMockApi.test.ts` — Expected: FAIL, module not found.

- [ ] **Step 5: Implement the mock API**

`src/api/mock/createMockApi.ts`:

```ts
import { EXAMPLE_DESCRIPTION } from '../examples';
import type { HubApi } from '../HubApi';
import type {
  CaseSummary,
  CaseThread,
  DraftSection,
  IdeaForm,
  Innovation,
  InstitutionProfile,
  LocalStats,
  MatchResults,
  MunicipalityFacts,
  Notification,
  PersonaId,
  ProblemCard,
  QueueFilter,
  QueuePage,
  ReasonSegment,
  RedactionResult,
  SubmittedCase,
  Trends,
} from '../types';
import { exampleDraft, exampleFacts } from './data/adaptation';
import { innovations } from './data/innovations';
import {
  exampleLocalStats,
  exampleMatches,
  exampleProblemCard,
  exampleReasons,
  exampleRedaction,
} from './data/matchmaking';
import { exampleTrends } from './data/trends';
import { createStore, type Store } from './store';

export interface MockApiOptions {
  /** Fixed delay per call. Omit for a random 600–1200 ms. */
  readonly delayMs?: number;
  readonly isOnline?: () => boolean;
  readonly now?: () => Date;
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise<void>(
    (resolve: () => void, reject: (reason: Error) => void): void => {
      if (signal?.aborted === true) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      const timer: ReturnType<typeof setTimeout> = setTimeout(resolve, ms);
      signal?.addEventListener(
        'abort',
        (): void => {
          clearTimeout(timer);
          reject(new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    },
  );
}

export function createMockApi(options: MockApiOptions = {}): HubApi {
  const store: Store = createStore(options.now);
  const isOnline: () => boolean =
    options.isOnline ?? ((): boolean => navigator.onLine);

  function pause(signal?: AbortSignal, factor: number = 1): Promise<void> {
    const base: number = options.delayMs ?? 600 + Math.random() * 600;
    return wait(base * factor, signal);
  }

  return {
    async redactDescription(
      text: string,
      signal?: AbortSignal,
    ): Promise<RedactionResult> {
      await pause(signal);
      if (text.trim() === EXAMPLE_DESCRIPTION) {
        return exampleRedaction;
      }
      return { segments: [{ kind: 'text', text }], replacements: [] };
    },

    async summariseProblem(
      _input: unknown,
      signal?: AbortSignal,
    ): Promise<ProblemCard> {
      await pause(signal);
      return exampleProblemCard;
    },

    async findMatches(
      _card: ProblemCard,
      signal?: AbortSignal,
    ): Promise<MatchResults> {
      await pause(signal);
      return exampleMatches;
    },

    async getMatchReason(
      innovationId: string,
      signal?: AbortSignal,
    ): Promise<readonly ReasonSegment[]> {
      const position: number = Object.keys(exampleReasons).indexOf(innovationId);
      await pause(signal, position + 1);
      return exampleReasons[innovationId] ?? [];
    },

    async getLocalStats(
      _municipality: string,
      signal?: AbortSignal,
    ): Promise<LocalStats> {
      await pause(signal);
      return exampleLocalStats;
    },

    async getInnovation(
      id: string,
      signal?: AbortSignal,
    ): Promise<Innovation> {
      await pause(signal);
      const found: Innovation | undefined = innovations[id];
      if (found === undefined) {
        throw new Error('Nie znaleziono innowacji.');
      }
      return found;
    },

    async getMunicipalityFacts(
      _municipality: string,
      signal?: AbortSignal,
    ): Promise<MunicipalityFacts> {
      await pause(signal);
      return exampleFacts;
    },

    async *draftService(
      _innovationId: string,
      _profile: InstitutionProfile,
      signal?: AbortSignal,
    ): AsyncGenerator<DraftSection> {
      for (const section of exampleDraft) {
        await pause(signal);
        yield section;
      }
    },

    async submitIdea(
      idea: IdeaForm,
      author: PersonaId | null,
      signal?: AbortSignal,
    ): Promise<SubmittedCase> {
      await pause(signal);
      return store.submitIdea(idea, author);
    },

    async listMyCases(
      persona: PersonaId,
      signal?: AbortSignal,
    ): Promise<readonly CaseSummary[]> {
      await pause(signal);
      return store.listMyCases(persona);
    },

    async getCase(id: string, signal?: AbortSignal): Promise<CaseThread> {
      await pause(signal);
      return store.getCase(id);
    },

    async sendMessage(
      caseId: string,
      from: PersonaId,
      text: string,
      signal?: AbortSignal,
    ): Promise<CaseThread> {
      await pause(signal);
      if (!isOnline()) {
        throw new Error('Brak połączenia.');
      }
      return store.sendMessage(caseId, from, text);
    },

    async listNotifications(
      persona: PersonaId,
      signal?: AbortSignal,
    ): Promise<readonly Notification[]> {
      await pause(signal);
      return store.listNotifications(persona);
    },

    async markAllRead(persona: PersonaId, signal?: AbortSignal): Promise<void> {
      await pause(signal);
      store.markAllRead(persona);
    },

    subscribeToNotifications(
      persona: PersonaId,
      onNew: (notification: Notification) => void,
    ): () => void {
      return store.subscribe(persona, onNew);
    },

    async listQueue(
      filter: QueueFilter,
      signal?: AbortSignal,
    ): Promise<QueuePage> {
      await pause(signal);
      return store.listQueue(filter);
    },

    async getTrends(signal?: AbortSignal): Promise<Trends> {
      await pause(signal);
      return exampleTrends;
    },
  };
}
```

`tsconfig.json` sets `noUnusedParameters`; parameters prefixed with `_` are
exempt, which is why the ignored inputs are named `_input`, `_card` and so on.

- [ ] **Step 6: Run the tests and commit**

Run: `npx vitest run src/api` — Expected: PASS.

```bash
npm run format && npm run check
git add -A frontend/src/api
git commit -m "feat: add example data and the mock HubApi"
```

---

### Task 5: App infrastructure — contexts, providers, `useAsync`

**Files:**
- Create: `src/app/contexts.ts`, `src/app/useAsync.ts`, `src/app/AppProviders.tsx`
- Test: `src/app/useAsync.test.tsx`

**Interfaces:**
- Consumes: `HubApi`, `PERSONAS`, `PERSONA_IDS`, `EXAMPLE_*` (Tasks 3–4).
- Produces, all from `app/contexts.ts`:
  - `useApi(): HubApi`
  - `useSession(): { persona: Persona | null; signIn: (id: PersonaId) => void; signOut: () => void }`
  - `useTextSize(): { percent: number; cycle: () => void }`
  - `useToast(): { toast: ToastMessage | null; show: (text: string, link?: ToastLink | null) => void; stub: () => void; dismiss: () => void }`
  - `useNotifications(): { items: readonly Notification[]; unread: number; markAllRead: () => void }`
  - `useMatchmaking(): { state: MatchmakingState; update: (patch: Partial<MatchmakingState>) => void }`
  - `useAdaptation(): { state: AdaptationState; update: (patch: Partial<AdaptationState>) => void }`
- Produces from `app/useAsync.ts`: `useAsync<T>(key: string, load: (signal: AbortSignal) => Promise<T>): { state: AsyncState<T>; retry: () => void }`
- Produces from `app/AppProviders.tsx`: `AppProviders({ api, children })`.

`useAsync` takes a string `key` instead of a dependency array: the request
reloads when the key changes. This keeps the hook free of spread dependency
arrays, which the linter rejects.

- [ ] **Step 1: Write the contexts**

`src/app/contexts.ts`:

```ts
import { createContext, useContext, type Context } from 'react';

import type { ProfileDraft } from '../api/examples';
import type { HubApi } from '../api/HubApi';
import type {
  Notification,
  Persona,
  PersonaId,
  ProblemCard,
} from '../api/types';

function useRequired<T>(context: Context<T | null>): T {
  const value: T | null = useContext(context);
  if (value === null) {
    throw new Error('AppProviders is missing above this component.');
  }
  return value;
}

// ── API ──────────────────────────────────────────────────────
export const ApiContext: Context<HubApi | null> = createContext<HubApi | null>(
  null,
);
export function useApi(): HubApi {
  return useRequired(ApiContext);
}

// ── Session ──────────────────────────────────────────────────
export interface SessionValue {
  readonly persona: Persona | null;
  readonly signIn: (id: PersonaId) => void;
  readonly signOut: () => void;
}
export const SessionContext: Context<SessionValue | null> =
  createContext<SessionValue | null>(null);
export function useSession(): SessionValue {
  return useRequired(SessionContext);
}

// ── Text size ────────────────────────────────────────────────
export interface TextSizeValue {
  readonly percent: number;
  readonly cycle: () => void;
}
export const TextSizeContext: Context<TextSizeValue | null> =
  createContext<TextSizeValue | null>(null);
export function useTextSize(): TextSizeValue {
  return useRequired(TextSizeContext);
}

// ── Toast ────────────────────────────────────────────────────
export interface ToastLink {
  readonly to: string;
  readonly label: string;
}
export interface ToastMessage {
  readonly id: number;
  readonly text: string;
  readonly link: ToastLink | null;
}
export interface ToastValue {
  readonly toast: ToastMessage | null;
  readonly show: (text: string, link?: ToastLink | null) => void;
  readonly stub: () => void;
  readonly dismiss: () => void;
}
export const STUB_MESSAGE: string =
  'Ta funkcja nie jest dostępna w wersji demonstracyjnej.';
export const ToastContext: Context<ToastValue | null> =
  createContext<ToastValue | null>(null);
export function useToast(): ToastValue {
  return useRequired(ToastContext);
}

// ── Notifications ────────────────────────────────────────────
export interface NotificationsValue {
  readonly items: readonly Notification[];
  readonly unread: number;
  readonly markAllRead: () => void;
}
export const NotificationsContext: Context<NotificationsValue | null> =
  createContext<NotificationsValue | null>(null);
export function useNotifications(): NotificationsValue {
  return useRequired(NotificationsContext);
}

// ── Matchmaking ──────────────────────────────────────────────
export interface MatchmakingState {
  readonly description: string;
  readonly municipality: string;
  readonly onBehalf: boolean;
  /** True once M1 was submitted; M2–M4 redirect to `/` while false. */
  readonly submitted: boolean;
  /** Ids of replacements the user restored on M2. */
  readonly restored: readonly string[];
  /** The card as edited on M3; null until M3 is confirmed. */
  readonly card: ProblemCard | null;
  readonly answers: Readonly<Record<string, string | null>>;
}
export interface MatchmakingValue {
  readonly state: MatchmakingState;
  readonly update: (patch: Partial<MatchmakingState>) => void;
}
export const MatchmakingContext: Context<MatchmakingValue | null> =
  createContext<MatchmakingValue | null>(null);
export function useMatchmaking(): MatchmakingValue {
  return useRequired(MatchmakingContext);
}

// ── Adaptation ───────────────────────────────────────────────
export interface AdaptationState {
  readonly draft: ProfileDraft;
  /** True once MW1 was submitted; MW2 redirects to MW1 while false. */
  readonly submitted: boolean;
}
export interface AdaptationValue {
  readonly state: AdaptationState;
  readonly update: (patch: Partial<AdaptationState>) => void;
}
export const AdaptationContext: Context<AdaptationValue | null> =
  createContext<AdaptationValue | null>(null);
export function useAdaptation(): AdaptationValue {
  return useRequired(AdaptationContext);
}
```

- [ ] **Step 2: Write the failing `useAsync` tests**

`src/app/useAsync.test.tsx`:

```tsx
import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useAsync, type AsyncResult } from './useAsync';

describe('useAsync', (): void => {
  it('goes from loading to ready', async (): Promise<void> => {
    const { result } = renderHook(
      (): AsyncResult<string> =>
        useAsync<string>('a', (): Promise<string> => Promise.resolve('ok')),
    );
    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'ok' });
    });
  });

  it('reports an error and recovers on retry', async (): Promise<void> => {
    let calls: number = 0;
    function load(): Promise<string> {
      calls += 1;
      return calls === 1
        ? Promise.reject(new Error('Nie udało się.'))
        : Promise.resolve('ok');
    }
    const { result } = renderHook(
      (): AsyncResult<string> => useAsync<string>('a', load),
    );
    await waitFor((): void => {
      expect(result.current.state).toEqual({
        status: 'error',
        message: 'Nie udało się.',
      });
    });
    act((): void => {
      result.current.retry();
    });
    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'ok' });
    });
  });

  it('reloads when the key changes', async (): Promise<void> => {
    const { result, rerender } = renderHook(
      ({ id }: { id: string }): AsyncResult<string> =>
        useAsync<string>(id, (): Promise<string> => Promise.resolve(id)),
      { initialProps: { id: 'first' } },
    );
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'first' });
    });
    rerender({ id: 'second' });
    expect(result.current.state).toEqual({ status: 'loading' });
    await waitFor((): void => {
      expect(result.current.state).toEqual({ status: 'ready', data: 'second' });
    });
  });

  it('aborts the request on unmount', (): void => {
    const signals: AbortSignal[] = [];
    const { unmount } = renderHook(
      (): AsyncResult<string> =>
        useAsync<string>('a', (signal: AbortSignal): Promise<string> => {
          signals.push(signal);
          return new Promise<string>((): void => undefined);
        }),
    );
    unmount();
    expect(signals.at(-1)?.aborted).toBe(true);
  });
});
```

Run: `npx vitest run src/app/useAsync.test.tsx` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement `useAsync`**

`src/app/useAsync.ts`:

```ts
import { useEffect, useEffectEvent, useState } from 'react';

export type AsyncState<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly data: T }
  | { readonly status: 'error'; readonly message: string };

export interface AsyncResult<T> {
  readonly state: AsyncState<T>;
  readonly retry: () => void;
}

interface Settled<T> {
  readonly token: string;
  readonly state: AsyncState<T>;
}

const DEFAULT_MESSAGE: string = 'Nie udało się wczytać danych.';

function toMessage(error: unknown): string {
  return error instanceof Error && error.message !== ''
    ? error.message
    : DEFAULT_MESSAGE;
}

/**
 * Loads data for `key`. The state is derived from the last settled request,
 * so a new key or a retry shows `loading` without a state update in the
 * effect body.
 */
export function useAsync<T>(
  key: string,
  load: (signal: AbortSignal) => Promise<T>,
): AsyncResult<T> {
  const [attempt, setAttempt] = useState<number>(0);
  const [settled, setSettled] = useState<Settled<T> | null>(null);
  const token: string = `${key}#${String(attempt)}`;
  const run: (signal: AbortSignal) => Promise<T> = useEffectEvent(
    (signal: AbortSignal): Promise<T> => load(signal),
  );

  useEffect((): (() => void) => {
    const controller: AbortController = new AbortController();
    run(controller.signal).then(
      (data: T): void => {
        if (!controller.signal.aborted) {
          setSettled({ token, state: { status: 'ready', data } });
        }
      },
      (error: unknown): void => {
        if (!controller.signal.aborted) {
          setSettled({
            token,
            state: { status: 'error', message: toMessage(error) },
          });
        }
      },
    );
    return (): void => {
      controller.abort();
    };
  }, [token]);

  const state: AsyncState<T> =
    settled !== null && settled.token === token
      ? settled.state
      : { status: 'loading' };

  function retry(): void {
    setAttempt((previous: number): number => previous + 1);
  }

  return { state, retry };
}
```

Run the test — Expected: PASS (4 tests).

- [ ] **Step 4: Implement the providers**

`src/app/AppProviders.tsx`:

```tsx
import {
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import {
  EXAMPLE_DESCRIPTION,
  EXAMPLE_MUNICIPALITY,
  EXAMPLE_PROFILE,
} from '../api/examples';
import type { HubApi } from '../api/HubApi';
import { PERSONA_IDS, PERSONAS } from '../api/personas';
import type { Notification, PersonaId } from '../api/types';
import {
  AdaptationContext,
  ApiContext,
  MatchmakingContext,
  NotificationsContext,
  SessionContext,
  STUB_MESSAGE,
  TextSizeContext,
  ToastContext,
  useApi,
  useSession,
  useToast,
  type AdaptationState,
  type AdaptationValue,
  type MatchmakingState,
  type MatchmakingValue,
  type NotificationsValue,
  type SessionValue,
  type TextSizeValue,
  type ToastLink,
  type ToastMessage,
  type ToastValue,
} from './contexts';
import { useAsync, type AsyncResult } from './useAsync';

interface ChildrenProps {
  readonly children: ReactNode;
}

const PERSONA_KEY: string = 'hubme.persona';
const TEXT_SIZE_KEY: string = 'hubme.textSize';
const TEXT_SIZES: readonly number[] = [100, 115, 130];
const TOAST_MS: number = 8000;

function readStored(key: string): string | null {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStored(key: string, value: string | null): void {
  try {
    if (value === null) {
      window.sessionStorage.removeItem(key);
    } else {
      window.sessionStorage.setItem(key, value);
    }
  } catch {
    // Storage can be unavailable; the app still works for this page view.
  }
}

function readPersona(): PersonaId | null {
  const raw: string | null = readStored(PERSONA_KEY);
  return PERSONA_IDS.find((id: PersonaId): boolean => id === raw) ?? null;
}

function readTextSize(): number {
  const raw: number = Number(readStored(TEXT_SIZE_KEY));
  return TEXT_SIZES.includes(raw) ? raw : 100;
}

function SessionProvider({ children }: ChildrenProps): ReactElement {
  const [id, setId] = useState<PersonaId | null>(readPersona);
  const value: SessionValue = useMemo(
    (): SessionValue => ({
      persona: id === null ? null : PERSONAS[id],
      signIn: (next: PersonaId): void => {
        writeStored(PERSONA_KEY, next);
        setId(next);
      },
      signOut: (): void => {
        writeStored(PERSONA_KEY, null);
        setId(null);
      },
    }),
    [id],
  );
  return <SessionContext value={value}>{children}</SessionContext>;
}

function TextSizeProvider({ children }: ChildrenProps): ReactElement {
  const [percent, setPercent] = useState<number>(readTextSize);

  useEffect((): void => {
    document.documentElement.style.fontSize = `${String(percent)}%`;
    writeStored(TEXT_SIZE_KEY, String(percent));
  }, [percent]);

  const value: TextSizeValue = useMemo(
    (): TextSizeValue => ({
      percent,
      cycle: (): void => {
        setPercent((current: number): number => {
          const index: number = TEXT_SIZES.indexOf(current);
          return TEXT_SIZES[(index + 1) % TEXT_SIZES.length] ?? 100;
        });
      },
    }),
    [percent],
  );
  return <TextSizeContext value={value}>{children}</TextSizeContext>;
}

function ToastProvider({ children }: ChildrenProps): ReactElement {
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastId: number | null = toast?.id ?? null;

  useEffect((): (() => void) | undefined => {
    if (toastId === null) {
      return undefined;
    }
    const timer: ReturnType<typeof setTimeout> = setTimeout((): void => {
      setToast(null);
    }, TOAST_MS);
    return (): void => {
      clearTimeout(timer);
    };
  }, [toastId]);

  const value: ToastValue = useMemo((): ToastValue => {
    function show(text: string, link: ToastLink | null = null): void {
      setToast(
        (previous: ToastMessage | null): ToastMessage => ({
          id: (previous?.id ?? 0) + 1,
          text,
          link,
        }),
      );
    }
    return {
      toast,
      show,
      stub: (): void => {
        show(STUB_MESSAGE);
      },
      dismiss: (): void => {
        setToast(null);
      },
    };
  }, [toast]);
  return <ToastContext value={value}>{children}</ToastContext>;
}

function NotificationsProvider({ children }: ChildrenProps): ReactElement {
  const api: HubApi = useApi();
  const { persona } = useSession();
  const { show } = useToast();
  const [version, setVersion] = useState<number>(0);
  const personaId: PersonaId | null = persona?.id ?? null;

  const { state }: AsyncResult<readonly Notification[]> = useAsync<
    readonly Notification[]
  >(
    `notifications:${personaId ?? 'none'}:${String(version)}`,
    (signal: AbortSignal): Promise<readonly Notification[]> =>
      personaId === null
        ? Promise.resolve([])
        : api.listNotifications(personaId, signal),
  );

  const announce: (notification: Notification) => void = useEffectEvent(
    (notification: Notification): void => {
      show(
        notification.text,
        notification.caseId === null
          ? null
          : { to: `/moje-sprawy/${notification.caseId}`, label: 'Otwórz wątek' },
      );
      setVersion((current: number): number => current + 1);
    },
  );

  useEffect((): (() => void) | undefined => {
    if (personaId === null) {
      return undefined;
    }
    return api.subscribeToNotifications(
      personaId,
      (notification: Notification): void => {
        announce(notification);
      },
    );
  }, [api, personaId]);

  const items: readonly Notification[] =
    state.status === 'ready' ? state.data : [];

  const value: NotificationsValue = useMemo(
    (): NotificationsValue => ({
      items,
      unread: items.filter((item: Notification): boolean => item.unread).length,
      markAllRead: (): void => {
        if (personaId === null) {
          return;
        }
        void api.markAllRead(personaId).then((): void => {
          setVersion((current: number): number => current + 1);
        });
      },
    }),
    [api, items, personaId],
  );
  return <NotificationsContext value={value}>{children}</NotificationsContext>;
}

const INITIAL_MATCHMAKING: MatchmakingState = {
  description: EXAMPLE_DESCRIPTION,
  municipality: EXAMPLE_MUNICIPALITY,
  onBehalf: true,
  submitted: false,
  restored: [],
  card: null,
  answers: {},
};

function MatchmakingProvider({ children }: ChildrenProps): ReactElement {
  const [state, setState] = useState<MatchmakingState>(INITIAL_MATCHMAKING);
  const value: MatchmakingValue = useMemo(
    (): MatchmakingValue => ({
      state,
      update: (patch: Partial<MatchmakingState>): void => {
        setState(
          (current: MatchmakingState): MatchmakingState => ({
            ...current,
            ...patch,
          }),
        );
      },
    }),
    [state],
  );
  return <MatchmakingContext value={value}>{children}</MatchmakingContext>;
}

const INITIAL_ADAPTATION: AdaptationState = {
  draft: EXAMPLE_PROFILE,
  submitted: false,
};

function AdaptationProvider({ children }: ChildrenProps): ReactElement {
  const [state, setState] = useState<AdaptationState>(INITIAL_ADAPTATION);
  const value: AdaptationValue = useMemo(
    (): AdaptationValue => ({
      state,
      update: (patch: Partial<AdaptationState>): void => {
        setState(
          (current: AdaptationState): AdaptationState => ({
            ...current,
            ...patch,
          }),
        );
      },
    }),
    [state],
  );
  return <AdaptationContext value={value}>{children}</AdaptationContext>;
}

interface AppProvidersProps {
  readonly api: HubApi;
  readonly children: ReactNode;
}

export function AppProviders({ api, children }: AppProvidersProps): ReactElement {
  return (
    <ApiContext value={api}>
      <SessionProvider>
        <TextSizeProvider>
          <ToastProvider>
            <NotificationsProvider>
              <MatchmakingProvider>
                <AdaptationProvider>{children}</AdaptationProvider>
              </MatchmakingProvider>
            </NotificationsProvider>
          </ToastProvider>
        </TextSizeProvider>
      </SessionProvider>
    </ApiContext>
  );
}
```

- [ ] **Step 5: Check and commit**

```bash
npm run format && npm run check
git add -A frontend/src/app
git commit -m "feat: add app contexts, providers and useAsync"
```

---

### Task 6: UI kit

**Files:**
- Create in `src/ui/`: `cx.ts`, `buttonClass.ts`, `Button.tsx`, `Button.module.css`, `ChoiceChip.tsx`, `ChoiceChip.module.css`, `Card.tsx`, `Card.module.css`, `AiBadge.tsx`, `AiBadge.module.css`, `Skeleton.tsx`, `Skeleton.module.css`, `FieldError.tsx`, `FieldError.module.css`, `Stepper.tsx`, `Stepper.module.css`, `StatusPill.tsx`, `StatusPill.module.css`, `Switch.tsx`, `Switch.module.css`, `LoadError.tsx`, `LoadError.module.css`
- Create: `src/api/status.ts`
- Test: `src/ui/ui.test.tsx`

**Interfaces — produces:**

```ts
cx(...parts: readonly (string | false | null | undefined)[]): string
buttonClass(variant?: ButtonVariant, size?: ButtonSize): string   // for <Link>
type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'link';
type ButtonSize = 'md' | 'lg';
Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?; size? })
ChoiceChip({ label: string; selected: boolean; onToggle: () => void })
Card({ children; className?: string; as?: 'div' | 'section' | 'article' })
AiBadge({ label?: string })            // label defaults to no text
Skeleton({ width?: string; height?: string })
FieldError({ id?: string; children })  // role="alert"
Stepper({ label: string; items: readonly StepItem[] })
  // StepItem = { label: string; state: 'done' | 'current' | 'todo'; note?: string }
StatusPill({ tone: StatusTone; icon: string; children })
  // StatusTone = 'new' | 'progress' | 'done' | 'alert' | 'closed'
Switch({ checked: boolean; onChange: (next: boolean) => void; children; stateLabel?: string })
LoadError({ message: string; onRetry: () => void })
// api/status.ts
STATUS_VIEW: Readonly<Record<CaseStatus, { tone: StatusTone; icon: string }>>
```

- [ ] **Step 1: Write the failing tests**

`src/ui/ui.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { describe, expect, it, vi, type Mock } from 'vitest';

import { ChoiceChip } from './ChoiceChip';
import { FieldError } from './FieldError';
import { LoadError } from './LoadError';
import { Stepper } from './Stepper';
import { Switch } from './Switch';

describe('ui kit', (): void => {
  it('ChoiceChip reports its state and toggles', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    const onToggle: Mock<() => void> = vi.fn<() => void>();
    render(<ChoiceChip label="KGW" selected onToggle={onToggle} />);
    const chip: HTMLElement = screen.getByRole('button', { name: 'KGW' });
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    await user.click(chip);
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('Switch exposes role and state', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    const onChange: Mock<(next: boolean) => void> =
      vi.fn<(next: boolean) => void>();
    render(
      <Switch checked={false} onChange={onChange}>
        Prosty język
      </Switch>,
    );
    const control: HTMLElement = screen.getByRole('switch', {
      name: 'Prosty język',
    });
    expect(control).toHaveAttribute('aria-checked', 'false');
    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('FieldError is an alert', (): void => {
    render(<FieldError>Opis jest za krótki.</FieldError>);
    expect(screen.getByRole('alert')).toHaveTextContent('Opis jest za krótki.');
  });

  it('LoadError retries', async (): Promise<void> => {
    const user: UserEvent = userEvent.setup();
    const onRetry: Mock<() => void> = vi.fn<() => void>();
    render(<LoadError message="Nie udało się wczytać danych." onRetry={onRetry} />);
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('Stepper marks the current step', (): void => {
    render(
      <Stepper
        label="Kroki"
        items={[
          { label: '1. Gmina', state: 'done' },
          { label: '2. Odbiorcy', state: 'current' },
          { label: '3. Budżet', state: 'todo' },
        ]}
      />,
    );
    const steps: HTMLElement[] = screen.getAllByRole('listitem');
    expect(steps[1]).toHaveAttribute('aria-current', 'step');
    expect(steps[0]).toHaveTextContent('✓ 1. Gmina');
  });
});
```

Run: `npx vitest run src/ui` — Expected: FAIL, modules not found.

- [ ] **Step 2: Implement helpers and `Button`**

`src/ui/cx.ts`:

```ts
export function cx(
  ...parts: readonly (string | false | null | undefined)[]
): string {
  return parts
    .filter(
      (part: string | false | null | undefined): part is string =>
        typeof part === 'string' && part !== '',
    )
    .join(' ');
}
```

`src/ui/buttonClass.ts`:

```ts
import styles from './Button.module.css';
import { cx } from './cx';

export type ButtonVariant = 'primary' | 'secondary' | 'neutral' | 'link';
export type ButtonSize = 'md' | 'lg';

/** The same look for a router `<Link>` as for `<Button>`. */
export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
): string {
  return cx(styles['button'], styles[variant], styles[size]);
}
```

`src/ui/Button.tsx`:

```tsx
import type { ButtonHTMLAttributes, ReactElement } from 'react';

import { buttonClass, type ButtonSize, type ButtonVariant } from './buttonClass';
import { cx } from './cx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      {...rest}
      type={type}
      className={cx(buttonClass(variant, size), className)}
    />
  );
}
```

`src/ui/Button.module.css`:

```css
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: var(--target);
  padding: 0 1rem;
  border: 1px solid transparent;
  border-radius: var(--radius);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary {
  background: var(--c-primary);
  color: var(--c-white);
}

.primary:hover:not(:disabled) {
  background: var(--c-primary-dark);
  color: var(--c-white);
}

.secondary {
  border: 2px solid var(--c-primary);
  background: transparent;
  color: var(--c-primary);
}

.neutral {
  border-color: var(--c-line-strong);
  background: var(--c-white);
  color: var(--c-ink);
}

.link {
  padding: 0 0.5rem;
  background: transparent;
  color: var(--c-ink);
  text-decoration: underline;
}

.lg {
  min-height: 3.625rem;
  padding: 0 1.875rem;
  font-size: 1.1875rem;
}
```

- [ ] **Step 3: Implement the remaining components**

`src/ui/ChoiceChip.tsx`:

```tsx
import type { ReactElement } from 'react';

import styles from './ChoiceChip.module.css';
import { cx } from './cx';

interface ChoiceChipProps {
  readonly label: string;
  readonly selected: boolean;
  readonly onToggle: () => void;
}

export function ChoiceChip({
  label,
  selected,
  onToggle,
}: ChoiceChipProps): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cx(styles['chip'], selected && styles['selected'])}
      onClick={onToggle}
    >
      {selected ? <span aria-hidden="true">✓ </span> : null}
      {label}
    </button>
  );
}
```

`src/ui/ChoiceChip.module.css`:

```css
.chip {
  display: inline-flex;
  align-items: center;
  min-height: var(--target);
  padding: 0 1rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
  font-size: 1.0625rem;
}

.selected {
  border: 2px solid var(--c-primary);
  background: var(--c-primary);
  color: var(--c-white);
  font-weight: 600;
}
```

`src/ui/Card.tsx`:

```tsx
import type { ReactElement, ReactNode } from 'react';

import styles from './Card.module.css';
import { cx } from './cx';

interface CardProps {
  readonly children: ReactNode;
  readonly className?: string;
  readonly as?: 'div' | 'section' | 'article';
}

export function Card({
  children,
  className,
  as: Tag = 'div',
}: CardProps): ReactElement {
  return <Tag className={cx(styles['card'], className)}>{children}</Tag>;
}
```

`src/ui/Card.module.css`:

```css
.card {
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-white);
}
```

`src/ui/AiBadge.tsx`:

```tsx
import type { ReactElement } from 'react';

import styles from './AiBadge.module.css';

interface AiBadgeProps {
  /** Text after the tag, e.g. "Sugestia AI, do weryfikacji". */
  readonly label?: string;
}

export function AiBadge({ label }: AiBadgeProps): ReactElement {
  if (label === undefined) {
    return <span className={styles['tag']}>AI</span>;
  }
  return (
    <span className={styles['badge']}>
      <span className={styles['tag']}>AI</span>
      {label}
    </span>
  );
}
```

`src/ui/AiBadge.module.css`:

```css
.tag {
  padding: 0.1875rem 0.375rem;
  border-radius: var(--radius);
  background: var(--c-ink);
  color: var(--c-white);
  font-size: 0.75rem;
  font-weight: 600;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  height: 2rem;
  padding: 0 0.75rem 0 0.25rem;
  border: 1.5px dashed var(--c-muted);
  border-radius: var(--radius);
  background: var(--c-white);
  font-size: 1rem;
  font-weight: 600;
}
```

`src/ui/Skeleton.tsx`:

```tsx
import type { ReactElement } from 'react';

import styles from './Skeleton.module.css';

interface SkeletonProps {
  readonly width?: string;
  readonly height?: string;
}

export function Skeleton({
  width = '100%',
  height = '1.25rem',
}: SkeletonProps): ReactElement {
  return (
    <div className={styles['skeleton']} style={{ width, height }} aria-hidden />
  );
}
```

`src/ui/Skeleton.module.css`:

```css
.skeleton {
  border-radius: var(--radius);
  background: var(--c-skeleton);
}
```

`src/ui/FieldError.tsx`:

```tsx
import type { ReactElement, ReactNode } from 'react';

import styles from './FieldError.module.css';

interface FieldErrorProps {
  readonly id?: string;
  readonly children: ReactNode;
}

export function FieldError({ id, children }: FieldErrorProps): ReactElement {
  return (
    <div id={id} role="alert" className={styles['error']}>
      <span className={styles['mark']} aria-hidden="true">
        !
      </span>
      <span>{children}</span>
    </div>
  );
}
```

`src/ui/FieldError.module.css`:

```css
.error {
  display: flex;
  align-items: flex-start;
  gap: 0.625rem;
  color: var(--c-danger);
  font-size: 1.0625rem;
  font-weight: 600;
}

.mark {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: var(--c-danger);
  color: var(--c-white);
  font-size: 0.9375rem;
}
```

`src/ui/Stepper.tsx`:

```tsx
import type { ReactElement } from 'react';

import { cx } from './cx';
import styles from './Stepper.module.css';

export interface StepItem {
  readonly label: string;
  readonly state: 'done' | 'current' | 'todo';
  readonly note?: string;
}

interface StepperProps {
  readonly label: string;
  readonly items: readonly StepItem[];
}

export function Stepper({ label, items }: StepperProps): ReactElement {
  return (
    <ol
      aria-label={label}
      className={styles['stepper']}
      style={{ gridTemplateColumns: `repeat(${String(items.length)}, minmax(0, 1fr))` }}
    >
      {items.map(
        (item: StepItem): ReactElement => (
          <li
            key={item.label}
            aria-current={item.state === 'current' ? 'step' : undefined}
            className={cx(styles['step'], styles[item.state])}
          >
            <div className={styles['bar']} />
            <span className={styles['label']}>
              {item.state === 'done' ? '✓ ' : ''}
              {item.label}
            </span>
            {item.note === undefined ? null : (
              <span className={styles['note']}>{item.note}</span>
            )}
          </li>
        ),
      )}
    </ol>
  );
}
```

`src/ui/Stepper.module.css`:

```css
.stepper {
  display: grid;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 1rem;
}

.step {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  color: var(--c-muted);
}

.bar {
  height: 0.375rem;
  border-radius: 0.1875rem;
  background: var(--c-line);
}

.label {
  font-weight: 400;
}

.note {
  color: var(--c-muted);
}

.done {
  color: var(--c-success);
}

.done .bar {
  background: var(--c-success);
}

.done .label,
.current .label {
  font-weight: 600;
}

.current {
  color: var(--c-ink);
}

.current .bar {
  background: var(--c-primary);
}
```

`src/ui/StatusPill.tsx`:

```tsx
import type { ReactElement, ReactNode } from 'react';

import { cx } from './cx';
import styles from './StatusPill.module.css';

export type StatusTone = 'new' | 'progress' | 'done' | 'alert' | 'closed';

interface StatusPillProps {
  readonly tone: StatusTone;
  readonly icon: string;
  readonly children: ReactNode;
}

export function StatusPill({
  tone,
  icon,
  children,
}: StatusPillProps): ReactElement {
  return (
    <span className={cx(styles['pill'], styles[tone])}>
      <span aria-hidden="true">{icon}</span>
      {children}
    </span>
  );
}
```

`src/ui/StatusPill.module.css`:

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius);
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
}

.new {
  background: var(--c-primary-tint);
  color: var(--c-danger);
}

.progress {
  background: var(--c-surface);
  color: var(--c-ink-2);
}

.done {
  background: var(--c-success-tint);
  color: var(--c-success);
}

.alert {
  background: var(--c-danger);
  color: var(--c-white);
}

.closed {
  background: var(--c-surface);
  color: var(--c-muted);
}
```

`src/ui/Switch.tsx`:

```tsx
import type { ReactElement, ReactNode } from 'react';

import { cx } from './cx';
import styles from './Switch.module.css';

interface SwitchProps {
  readonly checked: boolean;
  readonly onChange: (next: boolean) => void;
  readonly children: ReactNode;
  /** Optional trailing text such as "Włączone". Hidden from the name. */
  readonly stateLabel?: string;
}

export function Switch({
  checked,
  onChange,
  children,
  stateLabel,
}: SwitchProps): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={styles['switch']}
      onClick={(): void => {
        onChange(!checked);
      }}
    >
      <span className={cx(styles['track'], checked && styles['on'])} aria-hidden="true">
        <span className={styles['thumb']}>{checked ? '✓' : ''}</span>
      </span>
      <span>{children}</span>
      {stateLabel === undefined ? null : (
        <span className={styles['state']} aria-hidden="true">
          {stateLabel}
        </span>
      )}
    </button>
  );
}
```

`src/ui/Switch.module.css`:

```css
.switch {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: var(--target);
  padding: 0 0.875rem 0 0.5rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
}

.track {
  position: relative;
  display: inline-block;
  width: 2.5rem;
  height: 1.5rem;
  border-radius: var(--radius);
  background: var(--c-grey-400);
}

.thumb {
  position: absolute;
  top: 0.1875rem;
  left: 0.1875rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 50%;
  background: var(--c-white);
  color: var(--c-success);
  font-size: 0.75rem;
}

.on {
  background: var(--c-success);
}

.on .thumb {
  right: 0.1875rem;
  left: auto;
}

.state {
  margin-left: auto;
  color: var(--c-success);
  font-size: 0.9375rem;
}
```

`src/ui/LoadError.tsx`:

```tsx
import type { ReactElement } from 'react';

import { Button } from './Button';
import { FieldError } from './FieldError';
import styles from './LoadError.module.css';

interface LoadErrorProps {
  readonly message: string;
  readonly onRetry: () => void;
}

export function LoadError({ message, onRetry }: LoadErrorProps): ReactElement {
  return (
    <div className={styles['panel']}>
      <FieldError>{message}</FieldError>
      <Button variant="secondary" onClick={onRetry}>
        Spróbuj ponownie
      </Button>
    </div>
  );
}
```

`src/ui/LoadError.module.css`:

```css
.panel {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid var(--c-danger);
  border-radius: var(--radius);
}
```

`src/api/status.ts`:

```ts
import type { StatusTone } from '../ui/StatusPill';
import type { CaseStatus } from './types';

export const STATUS_VIEW: Readonly<
  Record<CaseStatus, { readonly tone: StatusTone; readonly icon: string }>
> = {
  Nowe: { tone: 'new', icon: '●' },
  'W trakcie': { tone: 'progress', icon: '◐' },
  Odpowiedziano: { tone: 'done', icon: '↩' },
  'Ponad 48 h': { tone: 'alert', icon: '!' },
  Zamknięte: { tone: 'closed', icon: '○' },
};
```

`StatusPill.tsx` exports a type next to its component. If the linter flags
that, move `StatusTone` into `src/ui/statusTone.ts` and import it from there in
both files; do the same for `StepItem`.

- [ ] **Step 4: Run the tests and commit**

Run: `npx vitest run src/ui` — Expected: PASS (5 tests).

```bash
npm run format && npm run check
git add -A frontend/src/ui frontend/src/api/status.ts
git commit -m "feat: add shared UI kit"
```

---

### Task 7: Shell, routing and guards

**Files:**
- Create in `src/shell/`: `navigation.ts`, `Root.tsx`, `PublicLayout.tsx`, `RopsLayout.tsx`, `HubTopBar.tsx`, `AiNotice.tsx`, `Footer.tsx`, `RopsSidebar.tsx`, `PersonaPicker.tsx`, `NotificationsPopover.tsx`, `ToastViewport.tsx`, `DemoStub.tsx`, each with a `.module.css` where it has markup
- Create: `src/app/RequirePersona.tsx`, `src/app/routes.tsx`, `src/test/renderApp.tsx`
- Modify: `src/App.tsx`
- Test: `src/shell/shell.test.tsx`
- Mockups: `HubTopBar.dc.html`, `RopsSidebar.dc.html`, `C1-Powiadomienia.dc.html` (popover and toast), `M1-Start.dc.html` (footer)

**Interfaces:**
- Consumes: everything from `app/contexts.ts`, `useAsync`, `createMockApi`, the UI kit.
- Produces:
  - `routes: RouteObject[]` — later tasks add their screens to it
  - `renderApp(path: string, options?: { api?: HubApi; persona?: PersonaId }): { api: HubApi; user: UserEvent; router: AppRouter }`
  - `RequirePersona({ role: PersonaRole; children })`
  - `PersonaPicker({ requiredRole: PersonaRole | null; onDone: (chosen: boolean) => void })`

- [ ] **Step 1: Write the test helper**

`src/test/renderApp.tsx`:

```tsx
import { render } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';

import type { HubApi } from '../api/HubApi';
import { createMockApi } from '../api/mock/createMockApi';
import type { PersonaId } from '../api/types';
import { AppProviders } from '../app/AppProviders';
import { routes } from '../app/routes';

export type AppRouter = ReturnType<typeof createMemoryRouter>;

export interface RenderAppOptions {
  readonly api?: HubApi;
  readonly persona?: PersonaId;
}

export interface RenderedApp {
  readonly api: HubApi;
  readonly user: UserEvent;
  readonly router: AppRouter;
}

/** Renders the whole app at `path` with a zero-delay mock API. */
export function renderApp(
  path: string,
  options: RenderAppOptions = {},
): RenderedApp {
  if (options.persona !== undefined) {
    window.sessionStorage.setItem('hubme.persona', options.persona);
  }
  const api: HubApi = options.api ?? createMockApi({ delayMs: 0 });
  const router: AppRouter = createMemoryRouter(routes, {
    initialEntries: [path],
  });
  const user: UserEvent = userEvent.setup();
  render(
    <AppProviders api={api}>
      <RouterProvider router={router} />
    </AppProviders>,
  );
  return { api, user, router };
}
```

- [ ] **Step 2: Write the failing shell tests**

`src/shell/shell.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { STUB_MESSAGE } from '../app/contexts';
import { renderApp } from '../test/renderApp';

describe('shell', (): void => {
  it('shows a visitor the brand, the navigation and a sign-in button', (): void => {
    renderApp('/nabory');
    expect(screen.getByText('HubMe')).toBeInTheDocument();
    const nav: HTMLElement = screen.getByRole('navigation', { name: 'Główna' });
    expect(within(nav).getAllByRole('link')).toHaveLength(5);
    expect(within(nav).getByRole('link', { name: 'Nabory' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeInTheDocument();
  });

  it('renders a placeholder page for an undesigned section', (): void => {
    renderApp('/nabory');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Nabory' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Ta część nie jest dostępna w wersji demonstracyjnej.'),
    ).toBeInTheDocument();
  });

  it('signs in through the persona picker and shows the unread badge', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));
    const picker: HTMLElement = screen.getByRole('dialog', {
      name: 'Wybierz osobę',
    });
    await user.click(within(picker).getByRole('button', { name: /Maria N\./ }));
    expect(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Konto: Maria N.' })).toHaveTextContent(
      'MN',
    );
  });

  it('lists notifications and marks them read', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'maria' });
    await user.click(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 3 nieprzeczytane',
      }),
    );
    const popover: HTMLElement = screen.getByRole('dialog', {
      name: 'Powiadomienia',
    });
    expect(within(popover).getAllByRole('listitem')).toHaveLength(4);
    await user.click(
      within(popover).getByRole('button', { name: 'Oznacz jako przeczytane' }),
    );
    expect(await within(popover).findByText('· 0 nieprzeczytane')).toBeInTheDocument();
  });

  it('shows the empty notifications state', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'anna' });
    await user.click(
      screen.getByRole('button', { name: 'Powiadomienia, 0 nieprzeczytane' }),
    );
    expect(
      await screen.findByText('Nie masz jeszcze powiadomień'),
    ).toBeInTheDocument();
  });

  it('signs out from the account menu', async (): Promise<void> => {
    const { user } = renderApp('/nabory', { persona: 'maria' });
    await user.click(screen.getByRole('button', { name: 'Konto: Maria N.' }));
    await user.click(screen.getByRole('menuitem', { name: 'Wyloguj' }));
    expect(screen.getByRole('button', { name: 'Zaloguj się' })).toBeInTheDocument();
  });

  it('cycles the text size through three steps', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    const button: HTMLElement = screen.getByRole('button', {
      name: 'Powiększ tekst',
    });
    expect(document.documentElement.style.fontSize).toBe('100%');
    await user.click(button);
    expect(document.documentElement.style.fontSize).toBe('115%');
    await user.click(button);
    expect(document.documentElement.style.fontSize).toBe('130%');
    await user.click(button);
    expect(document.documentElement.style.fontSize).toBe('100%');
  });

  it('answers a stubbed control with the demo notice', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    await user.click(screen.getByRole('switch', { name: 'Prosty język' }));
    expect(screen.getByRole('status')).toHaveTextContent(STUB_MESSAGE);
    await user.click(screen.getByRole('button', { name: 'Zamknij' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('asks for a curator before showing the ROPS panel', async (): Promise<void> => {
    const { user } = renderApp('/rops/kolejka');
    const picker: HTMLElement = screen.getByRole('dialog', {
      name: 'Wybierz osobę',
    });
    expect(
      within(picker).queryByRole('button', { name: /Maria N\./ }),
    ).not.toBeInTheDocument();
    await user.click(
      within(picker).getByRole('button', { name: /Anna Kowalczyk/ }),
    );
    expect(await screen.findByText('Panel ROPS')).toBeInTheDocument();
  });

  it('treats a signed-in non-curator the same way', (): void => {
    renderApp('/rops/kolejka', { persona: 'maria' });
    expect(screen.getByRole('dialog', { name: 'Wybierz osobę' })).toBeInTheDocument();
  });

  it('returns to the start page when the picker is cancelled', async (): Promise<void> => {
    const { user, router } = renderApp('/rops/kolejka');
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(router.state.location.pathname).toBe('/');
  });
});
```

Run: `npx vitest run src/shell` — Expected: FAIL, modules not found.

- [ ] **Step 3: Write the navigation tables**

`src/shell/navigation.ts`:

```ts
export interface NavItem {
  readonly label: string;
  readonly to: string;
  /** Path prefixes, besides `to` itself, that mark this item active. */
  readonly prefixes: readonly string[];
}

export const TOP_NAV: readonly NavItem[] = [
  { label: 'Znajdź rozwiązanie', to: '/', prefixes: ['/znajdz'] },
  { label: 'Biblioteka innowacji', to: '/biblioteka', prefixes: ['/innowacje'] },
  { label: 'Wyzwania Małopolski', to: '/wyzwania', prefixes: [] },
  { label: 'Zgłoś pomysł', to: '/zglos-pomysl', prefixes: [] },
  { label: 'Nabory', to: '/nabory', prefixes: [] },
];

export const SIDE_NAV: readonly NavItem[] = [
  { label: 'Pulpit', to: '/rops/pulpit', prefixes: [] },
  { label: 'Kolejka zgłoszeń', to: '/rops/kolejka', prefixes: ['/rops/kolejka/'] },
  { label: 'Innowacje', to: '/rops/innowacje', prefixes: [] },
  { label: 'Nabory', to: '/rops/nabory', prefixes: [] },
  { label: 'Trendy potrzeb', to: '/rops/trendy', prefixes: [] },
  { label: 'Eksperci i użytkownicy', to: '/rops/eksperci', prefixes: [] },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return (
    pathname === item.to ||
    item.prefixes.some((prefix: string): boolean => pathname.startsWith(prefix))
  );
}

/** The AI notice band is drawn on M1–M4, Z2, MW1 and MW2 only. */
export function showsAiNotice(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/znajdz') ||
    pathname.startsWith('/innowacje')
  );
}

export const STUB_TITLES: Readonly<Record<string, string>> = {
  '/biblioteka': 'Biblioteka innowacji',
  '/wyzwania': 'Wyzwania Małopolski',
  '/nabory': 'Nabory',
  '/kontakt': 'Kontakt z ROPS',
  '/dostepnosc': 'Deklaracja dostępności',
  '/jak-dziala-ai': 'Jak działa AI w HubMe',
  '/ustawienia-powiadomien': 'Ustawienia powiadomień',
  '/rops/pulpit': 'Pulpit',
  '/rops/innowacje': 'Innowacje',
  '/rops/nabory': 'Nabory',
  '/rops/eksperci': 'Eksperci i użytkownicy',
};
```

- [ ] **Step 4: Write the persona picker, toast viewport and stub page**

These three have no mockup, so their CSS is given in full.

`src/shell/PersonaPicker.tsx`:

```tsx
import type { ReactElement } from 'react';

import { PERSONA_IDS, PERSONAS } from '../api/personas';
import type { Persona, PersonaId, PersonaRole } from '../api/types';
import { useSession } from '../app/contexts';
import { Button } from '../ui/Button';
import styles from './PersonaPicker.module.css';

interface PersonaPickerProps {
  /** `curator` limits the list to the curator. */
  readonly requiredRole: PersonaRole | null;
  readonly onDone: (chosen: boolean) => void;
}

export function PersonaPicker({
  requiredRole,
  onDone,
}: PersonaPickerProps): ReactElement {
  const { signIn } = useSession();
  const choices: readonly Persona[] = PERSONA_IDS.map(
    (id: PersonaId): Persona => PERSONAS[id],
  ).filter(
    (persona: Persona): boolean =>
      requiredRole !== 'curator' || persona.role === 'curator',
  );

  return (
    <div className={styles['backdrop']}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Wybierz osobę"
        className={styles['dialog']}
      >
        <h2 className={styles['title']}>Wybierz osobę</h2>
        <p className={styles['lead']}>
          {requiredRole === 'curator'
            ? 'Panel ROPS jest dostępny dla kuratora.'
            : 'To wersja demonstracyjna. Zaloguj się jako jedna z przykładowych osób.'}
        </p>
        <ul className={styles['list']}>
          {choices.map(
            (persona: Persona): ReactElement => (
              <li key={persona.id}>
                <button
                  type="button"
                  className={styles['choice']}
                  onClick={(): void => {
                    signIn(persona.id);
                    onDone(true);
                  }}
                >
                  <span className={styles['avatar']} aria-hidden="true">
                    {persona.initials}
                  </span>
                  <span>
                    <strong>{persona.name}</strong> — {persona.description}
                  </span>
                </button>
              </li>
            ),
          )}
        </ul>
        <Button
          variant="link"
          onClick={(): void => {
            onDone(false);
          }}
        >
          Anuluj
        </Button>
      </div>
    </div>
  );
}
```

`src/shell/PersonaPicker.module.css`:

```css
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c-shadow);
}

.dialog {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  width: 32.5rem;
  padding: 1.75rem 2rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
  box-shadow: 0 1.125rem 3.125rem var(--c-shadow);
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
}

.lead {
  color: var(--c-ink-2);
  font-size: 1.0625rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
}

.choice {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: 100%;
  min-height: 3.5rem;
  padding: 0.5rem 1rem;
  border: 2px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-white);
  text-align: left;
}

.choice:hover {
  border-color: var(--c-primary);
}

.avatar {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 50%;
  background: var(--c-success-tint);
  color: var(--c-success);
  font-size: 1rem;
  font-weight: 600;
}
```

`src/shell/ToastViewport.tsx` (styles transcribed from the toast at the bottom
of `C1-Powiadomienia.dc.html`; `position: fixed; right: 2.5rem; bottom: 2.5rem;
z-index: 30`):

```tsx
import type { ReactElement } from 'react';
import { Link } from 'react-router';

import { useToast } from '../app/contexts';
import styles from './ToastViewport.module.css';

export function ToastViewport(): ReactElement | null {
  const { toast, dismiss } = useToast();
  if (toast === null) {
    return null;
  }
  return (
    <div role="status" aria-live="polite" className={styles['toast']}>
      <span className={styles['icon']} aria-hidden="true">
        ↩
      </span>
      <div className={styles['body']}>
        <span>{toast.text}</span>
        {toast.link === null ? null : (
          <Link to={toast.link.to} className={styles['link']} onClick={dismiss}>
            {toast.link.label}
          </Link>
        )}
      </div>
      <button
        type="button"
        aria-label="Zamknij"
        className={styles['close']}
        onClick={dismiss}
      >
        ✕
      </button>
    </div>
  );
}
```

`src/shell/DemoStub.tsx`:

```tsx
import type { ReactElement } from 'react';
import { Link, useLocation } from 'react-router';

import { buttonClass } from '../ui/buttonClass';
import styles from './DemoStub.module.css';
import { STUB_TITLES } from './navigation';

export function DemoStub(): ReactElement {
  const { pathname } = useLocation();
  const inPanel: boolean = pathname.startsWith('/rops');
  return (
    <main className={styles['stub']}>
      <h1 className={styles['title']}>
        {STUB_TITLES[pathname] ?? 'Strona niedostępna w demo'}
      </h1>
      <p className={styles['text']}>
        Ta część nie jest dostępna w wersji demonstracyjnej.
      </p>
      <Link
        to={inPanel ? '/rops/kolejka' : '/'}
        className={buttonClass('secondary')}
      >
        {inPanel ? 'Wróć do kolejki zgłoszeń' : 'Wróć na stronę główną'}
      </Link>
    </main>
  );
}
```

`src/shell/DemoStub.module.css`:

```css
.stub {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.25rem;
  max-width: 51.25rem;
  margin-inline: auto;
  padding: 5rem 2rem;
}

.title {
  font-size: 2.625rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.text {
  color: var(--c-ink-2);
  font-size: 1.3125rem;
}
```

- [ ] **Step 5: Write the notifications popover**

`src/shell/NotificationsPopover.tsx` (styles transcribed from the
`role="dialog"` block of `C1-Powiadomienia.dc.html`; position it
`absolute; top: calc(100% + 0.75rem); right: 0; width: 32.5rem; z-index: 10`):

```tsx
import type { ReactElement } from 'react';
import { Link } from 'react-router';

import type { Notification } from '../api/types';
import { useNotifications, useToast } from '../app/contexts';
import { Button } from '../ui/Button';
import { cx } from '../ui/cx';
import styles from './NotificationsPopover.module.css';

interface NotificationsPopoverProps {
  readonly onClose: () => void;
}

export function NotificationsPopover({
  onClose,
}: NotificationsPopoverProps): ReactElement {
  const { items, unread, markAllRead } = useNotifications();
  const { stub } = useToast();

  return (
    <div role="dialog" aria-label="Powiadomienia" className={styles['popover']}>
      <div className={styles['head']}>
        <strong className={styles['title']}>Powiadomienia</strong>
        {items.length === 0 ? null : (
          <>
            <span className={styles['count']}>
              · {String(unread)} nieprzeczytane
            </span>
            <button
              type="button"
              className={styles['markRead']}
              onClick={markAllRead}
            >
              Oznacz jako przeczytane
            </button>
          </>
        )}
      </div>
      {items.length === 0 ? (
        <div className={styles['empty']}>
          <strong className={styles['title']}>Nie masz jeszcze powiadomień</strong>
          <p>
            Tu zobaczysz odpowiedzi ROPS, ekspertów i autorów innowacji oraz
            nowe nabory w obszarach, które obserwujesz.
          </p>
          <Button variant="secondary" onClick={stub}>
            Wybierz obserwowane obszary
          </Button>
        </div>
      ) : (
        <ul className={styles['list']}>
          {items.map(
            (item: Notification): ReactElement => (
              <li
                key={item.id}
                className={cx(styles['item'], item.unread && styles['unread'])}
              >
                <span className={styles['icon']} aria-hidden="true">
                  {item.icon}
                </span>
                <div className={styles['body']}>
                  {item.caseId === null ? (
                    <span>{item.text}</span>
                  ) : (
                    <Link
                      to={`/moje-sprawy/${item.caseId}`}
                      className={styles['itemLink']}
                      onClick={onClose}
                    >
                      {item.text}
                    </Link>
                  )}
                  <span className={styles['meta']}>
                    {item.type} · {item.time}
                  </span>
                </div>
                {item.unread ? (
                  <span className={styles['fresh']}>Nowe</span>
                ) : null}
              </li>
            ),
          )}
        </ul>
      )}
      <Link
        to="/ustawienia-powiadomien"
        className={styles['settings']}
        onClick={onClose}
      >
        Ustawienia powiadomień
      </Link>
    </div>
  );
}
```

- [ ] **Step 6: Write the top bar**

`src/shell/HubTopBar.tsx`:

```tsx
import { useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router';

import {
  useNotifications,
  useSession,
  useTextSize,
  useToast,
} from '../app/contexts';
import { Button } from '../ui/Button';
import { cx } from '../ui/cx';
import { Switch } from '../ui/Switch';
import styles from './HubTopBar.module.css';
import { isNavActive, TOP_NAV, type NavItem } from './navigation';
import { NotificationsPopover } from './NotificationsPopover';
import { PersonaPicker } from './PersonaPicker';

type Panel = 'none' | 'picker' | 'bell' | 'menu';

export function HubTopBar(): ReactElement {
  const { pathname } = useLocation();
  const { persona, signOut } = useSession();
  const { cycle } = useTextSize();
  const { stub } = useToast();
  const { unread } = useNotifications();
  const [panel, setPanel] = useState<Panel>('none');

  function toggle(next: Panel): void {
    setPanel((current: Panel): Panel => (current === next ? 'none' : next));
  }

  function close(): void {
    setPanel('none');
  }

  return (
    <header className={styles['bar']}>
      <Link to="/" className={styles['brand']}>
        <span className={styles['logo']} aria-hidden="true">
          H
        </span>
        <span className={styles['name']}>HubMe</span>
      </Link>
      <nav aria-label="Główna" className={styles['nav']}>
        {TOP_NAV.map((item: NavItem): ReactElement => {
          const active: boolean = isNavActive(item, pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cx(styles['navLink'], active && styles['navActive'])}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles['tools']}>
        <Button
          variant="neutral"
          aria-label="Powiększ tekst"
          className={styles['textSize']}
          onClick={cycle}
        >
          A+
        </Button>
        <Switch checked={false} onChange={stub}>
          Prosty język
        </Switch>
        {persona === null ? (
          <Button
            variant="secondary"
            onClick={(): void => {
              toggle('picker');
            }}
          >
            Zaloguj się
          </Button>
        ) : (
          <>
            <div className={styles['anchor']}>
              <button
                type="button"
                className={styles['bell']}
                aria-label={`Powiadomienia, ${String(unread)} nieprzeczytane`}
                aria-expanded={panel === 'bell'}
                onClick={(): void => {
                  toggle('bell');
                }}
              >
                <span className={styles['bellIcon']} aria-hidden="true">
                  <span className={styles['bellDome']} />
                  <span className={styles['bellRim']} />
                  <span className={styles['bellClapper']} />
                </span>
                {unread > 0 ? (
                  <span className={styles['badge']} aria-hidden="true">
                    {unread}
                  </span>
                ) : null}
              </button>
              {panel === 'bell' ? <NotificationsPopover onClose={close} /> : null}
            </div>
            <Link to="/moje-sprawy" className={styles['cases']}>
              Moje sprawy
            </Link>
            <div className={styles['anchor']}>
              <button
                type="button"
                className={styles['avatar']}
                aria-label={`Konto: ${persona.name}`}
                aria-haspopup="menu"
                aria-expanded={panel === 'menu'}
                onClick={(): void => {
                  toggle('menu');
                }}
              >
                {persona.initials}
              </button>
              {panel === 'menu' ? (
                <div role="menu" className={styles['menu']}>
                  {persona.role === 'curator' ? (
                    <Link
                      role="menuitem"
                      to="/rops/kolejka"
                      className={styles['menuItem']}
                      onClick={close}
                    >
                      Panel ROPS
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    className={styles['menuItem']}
                    onClick={(): void => {
                      setPanel('picker');
                    }}
                  >
                    Zmień osobę
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className={styles['menuItem']}
                    onClick={(): void => {
                      close();
                      signOut();
                    }}
                  >
                    Wyloguj
                  </button>
                </div>
              ) : null}
            </div>
          </>
        )}
      </div>
      {panel === 'picker' ? (
        <PersonaPicker requiredRole={null} onDone={close} />
      ) : null}
    </header>
  );
}
```

`src/shell/HubTopBar.module.css` — the reference transcription of
`HubTopBar.dc.html`. Compare it with the mockup's inline styles to see how the
transcription rules apply:

```css
.bar {
  display: flex;
  align-items: center;
  gap: 1.125rem;
  height: 4.75rem;
  padding: 0 2rem;
  border-bottom: 1px solid var(--c-line);
  background: var(--c-white);
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--c-ink);
  text-decoration: none;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.125rem;
  height: 2.125rem;
  border-radius: var(--radius);
  background: var(--c-primary);
  color: var(--c-white);
  font-size: 1.1875rem;
  font-weight: 600;
}

.name {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.nav {
  display: flex;
  gap: 0.125rem;
  height: 100%;
}

.navLink {
  display: flex;
  align-items: center;
  padding: 0 0.5625rem;
  border-top: 4px solid transparent;
  border-bottom: 3px solid transparent;
  color: var(--c-ink);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  text-decoration: none;
  text-transform: uppercase;
  white-space: nowrap;
}

.navActive {
  border-bottom-color: var(--c-primary);
  color: var(--c-primary);
}

.tools {
  display: flex;
  flex: none;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.textSize {
  min-width: 3rem;
  font-size: 1.125rem;
}

.anchor {
  position: relative;
}

.bell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 2.75rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
}

.bellIcon {
  position: relative;
  display: inline-block;
  width: 1.25rem;
  height: 1.375rem;
}

.bellDome {
  position: absolute;
  top: 1px;
  left: 3px;
  width: 0.625rem;
  height: 0.8125rem;
  border: 2px solid var(--c-ink);
  border-bottom: none;
  border-radius: 0.5rem 0.5rem 0 0;
}

.bellRim {
  position: absolute;
  top: 0.9375rem;
  left: 0;
  width: 1.25rem;
  height: 2px;
  background: var(--c-ink);
}

.bellClapper {
  position: absolute;
  top: 1.125rem;
  left: 0.5rem;
  width: 0.25rem;
  height: 0.25rem;
  border-radius: 50%;
  background: var(--c-ink);
}

.badge {
  position: absolute;
  top: -0.5625rem;
  right: -0.5625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 1.5rem;
  height: 1.5rem;
  padding: 0 0.375rem;
  border: 2px solid var(--c-white);
  border-radius: var(--radius);
  background: var(--c-primary);
  color: var(--c-white);
  font-size: 0.875rem;
  font-weight: 600;
}

.cases {
  display: flex;
  align-items: center;
  height: 2.75rem;
  padding: 0 0.375rem;
  color: var(--c-ink);
  font-size: 1.0625rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border: none;
  border-radius: 50%;
  background: var(--c-success-tint);
  color: var(--c-success);
  font-size: 1rem;
  font-weight: 600;
}

/* The account menu has no mockup. */
.menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  padding: 0.375rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
  box-shadow: 0 1.125rem 3.125rem var(--c-shadow);
}

.menuItem {
  display: flex;
  align-items: center;
  min-height: var(--target);
  padding: 0 0.75rem;
  border: none;
  border-radius: var(--radius);
  background: transparent;
  color: var(--c-ink);
  font-size: 1.0625rem;
  font-weight: 600;
  text-align: left;
  text-decoration: none;
}

.menuItem:hover {
  background: var(--c-surface);
  color: var(--c-ink);
}
```

- [ ] **Step 7: Write the AI notice, footer and sidebar**

`src/shell/AiNotice.tsx` (styles from the `role="note"` block of `HubTopBar.dc.html`):

```tsx
import type { ReactElement } from 'react';

import { useToast } from '../app/contexts';
import styles from './AiNotice.module.css';

export function AiNotice(): ReactElement {
  const { stub } = useToast();
  return (
    <div role="note" className={styles['notice']}>
      <span className={styles['tag']}>AI</span>
      <span>
        Wyniki przygotowuje system AI na podstawie bazy przetestowanych
        innowacji.{' '}
        <strong className={styles['strong']}>Decyzję podejmuje człowiek.</strong>
      </span>
      <button type="button" className={styles['human']} onClick={stub}>
        Wolisz porozmawiać z człowiekiem?
      </button>
    </div>
  );
}
```

`src/shell/Footer.tsx` (styles from the `<footer>` of `M1-Start.dc.html`):

```tsx
import type { ReactElement } from 'react';
import { Link } from 'react-router';

import styles from './Footer.module.css';

export function Footer(): ReactElement {
  return (
    <footer className={styles['footer']}>
      <Link to="/kontakt">Kontakt z ROPS</Link>
      <Link to="/dostepnosc">Deklaracja dostępności</Link>
      <Link to="/jak-dziala-ai">Jak działa AI w HubMe</Link>
      <span className={styles['note']}>
        Wszystkie dane na makietach są przykładowe
      </span>
    </footer>
  );
}
```

`src/shell/RopsSidebar.tsx` (styles from `RopsSidebar.dc.html`; the last row of
three controls has no mockup — style them as small underlined links in
`var(--c-blue-200)`):

```tsx
import { useState, type ReactElement } from 'react';
import { Link, useLocation } from 'react-router';

import type { HubApi } from '../api/HubApi';
import type { QueuePage } from '../api/types';
import { useApi, useSession, useTextSize, useToast } from '../app/contexts';
import { useAsync, type AsyncResult } from '../app/useAsync';
import { cx } from '../ui/cx';
import { isNavActive, SIDE_NAV, type NavItem } from './navigation';
import { PersonaPicker } from './PersonaPicker';
import styles from './RopsSidebar.module.css';

export function RopsSidebar(): ReactElement {
  const api: HubApi = useApi();
  const { pathname } = useLocation();
  const { persona, signOut } = useSession();
  const { cycle } = useTextSize();
  const { stub } = useToast();
  const [picking, setPicking] = useState<boolean>(false);
  const { state }: AsyncResult<QueuePage> = useAsync<QueuePage>(
    'sidebar-queue',
    (signal: AbortSignal): Promise<QueuePage> =>
      api.listQueue({ type: null }, signal),
  );
  const fresh: number | null =
    state.status === 'ready' ? state.data.fresh : null;

  return (
    <aside className={styles['sidebar']}>
      <div className={styles['brand']}>
        <span className={styles['logo']} aria-hidden="true">
          H
        </span>
        <div className={styles['brandText']}>
          <span className={styles['name']}>HubMe</span>
          <span className={styles['sub']}>Panel ROPS</span>
        </div>
      </div>
      <nav aria-label="Panel" className={styles['nav']}>
        {SIDE_NAV.map((item: NavItem): ReactElement => {
          const active: boolean = isNavActive(item, pathname);
          return (
            <Link
              key={item.label}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cx(styles['link'], active && styles['active'])}
            >
              <span className={styles['marker']} aria-hidden="true" />
              {item.label}
              {item.to === '/rops/kolejka' && fresh !== null ? (
                <span className={styles['count']}>{fresh}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className={styles['foot']}>
        <div className={styles['access']}>
          <button
            type="button"
            aria-label="Powiększ tekst"
            className={styles['footButton']}
            onClick={cycle}
          >
            A+
          </button>
          <button type="button" className={styles['footWide']} onClick={stub}>
            Prosty język
          </button>
        </div>
        <div className={styles['who']}>
          <span className={styles['avatar']} aria-hidden="true">
            {persona?.initials}
          </span>
          <div className={styles['whoText']}>
            <span className={styles['whoName']}>{persona?.name}</span>
            <span className={styles['sub']}>Kuratorka · przykład</span>
          </div>
        </div>
        <div className={styles['session']}>
          <button
            type="button"
            className={styles['sessionLink']}
            onClick={(): void => {
              setPicking(true);
            }}
          >
            Zmień osobę
          </button>
          <button type="button" className={styles['sessionLink']} onClick={signOut}>
            Wyloguj
          </button>
          <Link to="/" className={styles['sessionLink']}>
            Strona główna
          </Link>
        </div>
      </div>
      {picking ? (
        <PersonaPicker
          requiredRole={null}
          onDone={(): void => {
            setPicking(false);
          }}
        />
      ) : null}
    </aside>
  );
}
```

- [ ] **Step 8: Write the layouts, the guard, the routes and `App`**

`src/shell/Root.tsx`:

```tsx
import type { ReactElement } from 'react';
import { Outlet } from 'react-router';

import { ToastViewport } from './ToastViewport';

export function Root(): ReactElement {
  return (
    <>
      <Outlet />
      <ToastViewport />
    </>
  );
}
```

`src/shell/PublicLayout.tsx`:

```tsx
import type { ReactElement } from 'react';
import { Outlet, useLocation } from 'react-router';

import { AiNotice } from './AiNotice';
import { Footer } from './Footer';
import { HubTopBar } from './HubTopBar';
import { showsAiNotice } from './navigation';
import styles from './PublicLayout.module.css';

export function PublicLayout(): ReactElement {
  const { pathname } = useLocation();
  return (
    <div className={styles['page']}>
      <HubTopBar />
      {showsAiNotice(pathname) ? <AiNotice /> : null}
      <div className={styles['content']}>
        <Outlet />
      </div>
      {pathname === '/' ? <Footer /> : null}
    </div>
  );
}
```

`src/shell/PublicLayout.module.css`:

```css
.page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
}
```

`src/shell/RopsLayout.tsx`:

```tsx
import type { ReactElement } from 'react';
import { Outlet } from 'react-router';

import styles from './RopsLayout.module.css';
import { RopsSidebar } from './RopsSidebar';

export function RopsLayout(): ReactElement {
  return (
    <div className={styles['page']}>
      <RopsSidebar />
      <div className={styles['content']}>
        <Outlet />
      </div>
    </div>
  );
}
```

`src/shell/RopsLayout.module.css`:

```css
.page {
  display: flex;
  min-height: 100vh;
}

.content {
  flex: 1;
  min-width: 0;
}
```

`src/app/RequirePersona.tsx`:

```tsx
import type { ReactElement, ReactNode } from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';

import type { PersonaRole } from '../api/types';
import { PersonaPicker } from '../shell/PersonaPicker';
import { useSession } from './contexts';

interface RequirePersonaProps {
  /** `user` admits any signed-in persona; `curator` only the curator. */
  readonly role: PersonaRole;
  readonly children: ReactNode;
}

export function RequirePersona({
  role,
  children,
}: RequirePersonaProps): ReactElement {
  const { persona } = useSession();
  const navigate: NavigateFunction = useNavigate();
  const allowed: boolean =
    persona !== null && (role === 'user' || persona.role === 'curator');

  if (allowed) {
    return <>{children}</>;
  }
  return (
    <PersonaPicker
      requiredRole={role}
      onDone={(chosen: boolean): void => {
        if (!chosen) {
          void navigate('/');
        }
      }}
    />
  );
}
```

`src/app/routes.tsx`:

```tsx
import { Navigate, type RouteObject } from 'react-router';

import { DemoStub } from '../shell/DemoStub';
import { PublicLayout } from '../shell/PublicLayout';
import { Root } from '../shell/Root';
import { RopsLayout } from '../shell/RopsLayout';
import { RequirePersona } from './RequirePersona';

export const routes: RouteObject[] = [
  {
    element: <Root />,
    children: [
      {
        element: <PublicLayout />,
        children: [{ path: '*', element: <DemoStub /> }],
      },
      {
        path: 'rops',
        element: (
          <RequirePersona role="curator">
            <RopsLayout />
          </RequirePersona>
        ),
        children: [
          { index: true, element: <Navigate to="/rops/kolejka" replace /> },
          { path: '*', element: <DemoStub /> },
        ],
      },
    ],
  },
];
```

If the linter flags `routes.tsx` under `react-refresh/only-export-components`,
add `'src/app/routes.tsx'` to the `files` list of the override block added in
Task 2.

Replace `src/App.tsx`:

```tsx
import type { ReactElement } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router';

import type { HubApi } from './api/HubApi';
import { createMockApi } from './api/mock/createMockApi';
import { AppProviders } from './app/AppProviders';
import { routes } from './app/routes';

const api: HubApi = createMockApi();
const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter(routes);

export function App(): ReactElement {
  return (
    <AppProviders api={api}>
      <RouterProvider router={router} />
    </AppProviders>
  );
}
```

`App.tsx` is the only file outside `api/` that imports from `api/mock/`.

- [ ] **Step 9: Write the remaining CSS modules**

Write `AiNotice.module.css`, `Footer.module.css`, `RopsSidebar.module.css`,
`NotificationsPopover.module.css` and `ToastViewport.module.css` by applying
the transcription rules to the mockup blocks named in Steps 4–7. The class
names are the ones used in the TSX above. In `RopsSidebar.module.css` the
`aside` is `width: 17.5rem; flex: none; min-height: 100vh`.

- [ ] **Step 10: Run the tests, look at it, commit**

Run: `npx vitest run src/shell src/App.test.tsx` — Expected: PASS (11 + 1).

Run `npm run dev`, open <http://localhost:5173/nabory> at a 1440px-wide window
and compare the top bar with `HubTopBar.dc.html`; sign in as the curator, open
<http://localhost:5173/rops/pulpit> and compare the sidebar with
`RopsSidebar.dc.html`.

```bash
npm run format && npm run check
git add -A frontend/src
git commit -m "feat: add app shell, routing, persona picker and notifications"
```

---

### Task 8: Matchmaking — M1 describe problem, M2 preview

**Files:**
- Create in `src/features/matchmaking/`: `StartScreen.tsx`, `StartScreen.module.css`, `PreviewScreen.tsx`, `PreviewScreen.module.css`, `FlowSteps.tsx`, `FlowSteps.module.css`
- Modify: `src/app/routes.tsx`
- Test: `src/features/matchmaking/matchmaking.test.tsx`
- Mockups: `M1-Start.dc.html`, `M2-Podglad.dc.html`

**Interfaces:**
- Consumes: `useMatchmaking`, `useApi`, `useToast`, `useAsync`, UI kit, `EXAMPLE_PROMPTS`.
- Produces: `StartScreen`, `PreviewScreen`, `FlowSteps({ current: 2 | 3 })`.

- [ ] **Step 1: Write the failing tests**

`src/features/matchmaking/matchmaking.test.tsx`:

```tsx
import { screen } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { EXAMPLE_DESCRIPTION } from '../../api/examples';
import { renderApp } from '../../test/renderApp';

const OWN_TEXT: string =
  'W naszej wsi młodzież po lekcjach nie ma gdzie się spotykać, a świetlica jest zamknięta od roku.';

async function describeProblem(user: UserEvent, text: string): Promise<void> {
  const field: HTMLElement = screen.getByRole('textbox', {
    name: 'Opisz problem',
  });
  await user.clear(field);
  await user.type(field, text);
  await user.click(screen.getByRole('button', { name: 'Dalej →' }));
}

describe('M1 describe problem', (): void => {
  it('opens pre-filled with the example description', (): void => {
    renderApp('/');
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Znajdź sprawdzone rozwiązanie problemu społecznego',
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      EXAMPLE_DESCRIPTION,
    );
  });

  it('rejects a short description and keeps the text', async (): Promise<void> => {
    const { user, router } = renderApp('/');
    await describeProblem(user, 'Starsi ludzie są samotni.');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Opis jest za krótki. Dopisz 2–3 zdania: kogo dotyczy problem i co jest najtrudniejsze.',
    );
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Opisz problem',
    });
    expect(field).toHaveValue('Starsi ludzie są samotni.');
    expect(field).toHaveFocus();
    expect(router.state.location.pathname).toBe('/');
  });

  it('fills the description from an example', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(
      screen.getByRole('button', {
        name: '„Młodzież po szkole nie ma gdzie się spotykać”',
      }),
    );
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      'Młodzież po szkole nie ma gdzie się spotykać',
    );
  });
});

describe('M2 preview', (): void => {
  it('shows the five replacements for the example description', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Dalej →' }));
    expect(
      screen.getByRole('heading', { level: 1, name: 'Tak zobaczy to system' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Zamiany (5)')).toBeInTheDocument();
    expect(screen.getByText('● OSOBA_A')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Usunęliśmy 5 informacji, które mogą identyfikować osobę. Do wyszukiwania nie są potrzebne.',
      ),
    ).toBeInTheDocument();
  });

  it('restores a replacement and removes it again', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Dalej →' }));
    await user.click(
      await screen.findByRole('button', { name: 'Cofnij zamianę OSOBA_A' }),
    );
    expect(screen.getByText('Pani Janina')).toBeInTheDocument();
    expect(screen.queryByText('● OSOBA_A')).not.toBeInTheDocument();
    expect(screen.getByText(/^Usunęliśmy 4 informacje,/)).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: 'Usuń ponownie OSOBA_A' }),
    );
    expect(screen.getByText('● OSOBA_A')).toBeInTheDocument();
  });

  it('never offers to restore health information', async (): Promise<void> => {
    const { user } = renderApp('/');
    await user.click(screen.getByRole('button', { name: 'Dalej →' }));
    await screen.findByText('Zamiany (5)');
    expect(
      screen.queryByRole('button', { name: 'Cofnij zamianę ZDROWIE' }),
    ).not.toBeInTheDocument();
  });

  it('shows own text unchanged with nothing removed', async (): Promise<void> => {
    const { user } = renderApp('/');
    await describeProblem(user, OWN_TEXT);
    expect(
      await screen.findByText(
        'Nie znaleźliśmy informacji, które mogą identyfikować osobę.',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(OWN_TEXT)).toBeInTheDocument();
    expect(screen.queryByText(/^Zamiany/)).not.toBeInTheDocument();
  });

  it('goes back to editing with the text kept', async (): Promise<void> => {
    const { user } = renderApp('/');
    await describeProblem(user, OWN_TEXT);
    await user.click(screen.getByRole('link', { name: '← Wróć do edycji' }));
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      OWN_TEXT,
    );
  });

  it('redirects to the start when opened without a description', (): void => {
    const { router } = renderApp('/znajdz/podglad');
    expect(router.state.location.pathname).toBe('/');
  });
});
```

Run: `npx vitest run src/features/matchmaking` — Expected: FAIL.

- [ ] **Step 2: Implement `FlowSteps`**

`src/features/matchmaking/FlowSteps.tsx` (styles from the first `div` inside
`<main>` of `M2-Podglad.dc.html`):

```tsx
import { Fragment, type ReactElement } from 'react';

import { cx } from '../../ui/cx';
import styles from './FlowSteps.module.css';

const STEPS: readonly string[] = [
  'Opis',
  'Podgląd',
  'Doprecyzowanie',
  'Wyniki',
];

interface FlowStepsProps {
  /** 1-based number of the current step. */
  readonly current: 2 | 3;
}

export function FlowSteps({ current }: FlowStepsProps): ReactElement {
  return (
    <ol aria-label="Etapy" className={styles['steps']}>
      {STEPS.map((label: string, index: number): ReactElement => {
        const position: number = index + 1;
        return (
          <Fragment key={label}>
            {index > 0 ? (
              <li aria-hidden="true" className={styles['dash']}>
                —
              </li>
            ) : null}
            <li
              aria-current={position === current ? 'step' : undefined}
              className={cx(
                position < current && styles['done'],
                position === current && styles['current'],
              )}
            >
              {position < current ? '✓ ' : ''}
              {String(position)}. {label}
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: Implement M1**

`src/features/matchmaking/StartScreen.tsx` — the fully worked screen. Write
`StartScreen.module.css` from `M1-Start.dc.html` with one class per
`styles[...]` key used below.

```tsx
import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
  type SyntheticEvent,
} from 'react';
import { useNavigate, type NavigateFunction } from 'react-router';

import { EXAMPLE_PROMPTS } from '../../api/examples';
import { useMatchmaking, useToast } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import { Switch } from '../../ui/Switch';
import styles from './StartScreen.module.css';

const MIN_LENGTH: number = 60;

export function StartScreen(): ReactElement {
  const { state, update } = useMatchmaking();
  const { stub } = useToast();
  const navigate: NavigateFunction = useNavigate();
  const [description, setDescription] = useState<string>(state.description);
  const [municipality, setMunicipality] = useState<string>(state.municipality);
  const [onBehalf, setOnBehalf] = useState<boolean>(state.onBehalf);
  const [invalid, setInvalid] = useState<boolean>(false);
  const field: RefObject<HTMLTextAreaElement | null> =
    useRef<HTMLTextAreaElement>(null);

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    if (description.trim().length < MIN_LENGTH) {
      setInvalid(true);
      field.current?.focus();
      return;
    }
    update({
      description: description.trim(),
      municipality,
      onBehalf,
      submitted: true,
      restored: [],
      card: null,
      answers: {},
    });
    void navigate('/znajdz/podglad');
  }

  return (
    <main className={styles['main']}>
      <div className={styles['intro']}>
        <span className={styles['eyebrow']}>Matchmaking społeczny</span>
        <h1 className={styles['title']}>
          Znajdź sprawdzone rozwiązanie problemu społecznego
        </h1>
        <p className={styles['lead']}>
          Opisz sytuację własnymi słowami. Pokażemy innowacje, które ktoś już
          przetestował w Polsce. Nie musisz się logować.
        </p>
      </div>
      <form className={styles['form']} onSubmit={submit} noValidate>
        <div className={styles['field']}>
          <label htmlFor="description" className={styles['label']}>
            Opisz problem
          </label>
          {invalid ? (
            <FieldError id="description-error">
              Opis jest za krótki. Dopisz 2–3 zdania: kogo dotyczy problem i co
              jest najtrudniejsze.
            </FieldError>
          ) : null}
          <div className={styles['textareaWrap']}>
            <textarea
              id="description"
              ref={field}
              className={cx(styles['textarea'], invalid && styles['invalid'])}
              value={description}
              aria-invalid={invalid}
              aria-describedby={invalid ? 'description-error' : 'description-hint'}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
                setDescription(event.target.value);
                setInvalid(false);
              }}
            />
            <Button
              variant="neutral"
              aria-label="Dyktuj opis"
              className={styles['dictate']}
              onClick={stub}
            >
              <span className={styles['mic']} aria-hidden="true" />
              Dyktuj
            </Button>
          </div>
          <p id="description-hint" className={styles['hint']}>
            <span className={styles['info']} aria-hidden="true">
              i
            </span>
            Opisz problem, nie osobę. Nie podawaj imion, adresów ani informacji
            o zdrowiu.
          </p>
        </div>
        <div className={styles['row']}>
          <div className={styles['field']}>
            <label htmlFor="municipality" className={styles['labelSmall']}>
              Gmina lub powiat{' '}
              <span className={styles['optional']}>(opcjonalnie)</span>
            </label>
            <input
              id="municipality"
              className={styles['input']}
              value={municipality}
              onChange={(event: ChangeEvent<HTMLInputElement>): void => {
                setMunicipality(event.target.value);
              }}
            />
          </div>
          <Switch
            checked={onBehalf}
            onChange={setOnBehalf}
            stateLabel={onBehalf ? 'Włączone' : 'Wyłączone'}
          >
            Zgłaszam w czyimś imieniu
          </Switch>
        </div>
        <div className={styles['examples']}>
          <span className={styles['labelSmall']}>
            Nie wiesz, jak zacząć? Kliknij przykład:
          </span>
          <div className={styles['exampleGrid']}>
            {EXAMPLE_PROMPTS.map(
              (prompt: string): ReactElement => (
                <button
                  key={prompt}
                  type="button"
                  className={styles['example']}
                  onClick={(): void => {
                    setDescription(prompt);
                    setInvalid(false);
                  }}
                >
                  „{prompt}”
                </button>
              ),
            )}
          </div>
        </div>
        <div className={styles['actions']}>
          <Button type="submit" size="lg" className={styles['submit']}>
            Dalej →
          </Button>
          <span className={styles['note']}>Zajmie to około 2 minut.</span>
        </div>
      </form>
      <div className={styles['human']}>
        <span className={styles['humanBadge']} aria-hidden="true">
          ROPS
        </span>
        <div className={styles['humanText']}>
          <strong>Wolisz porozmawiać z człowiekiem?</strong>
          <span>
            Dział Innowacji Społecznych ROPS w Krakowie · tel. 12 000 00 00
            (przykład) · pon.–pt. 8:00–16:00
          </span>
        </div>
        <button type="button" className={styles['humanLink']} onClick={stub}>
          Napisz do nas
        </button>
      </div>
    </main>
  );
}
```

CSS notes for M1 that the rules do not cover:
- `.main` is `max-width: 60rem; margin-inline: auto; padding: 3.5rem 2rem 3rem`.
- `.textarea` is a real textarea: `width: 100%; min-height: 12.5rem; resize: vertical`, with the mockup's border and padding. `.invalid` switches the border to `3px solid var(--c-danger)`.
- The mockup's 48px-tall "Dyktuj" button sits `position: absolute; right: 1rem; bottom: 1rem` inside `.textareaWrap` (`position: relative`).
- The mockup's municipality field shows a small circle and the word "przykład"; omit both, the field is a plain input.
- The `Switch` in `.row` needs `height: 3.5rem`; pass no extra class — wrap it in a grid cell that stretches it.

- [ ] **Step 4: Implement M2**

`src/features/matchmaking/PreviewScreen.tsx`:

```tsx
import type { ReactElement } from 'react';
import {
  Link,
  Navigate,
  useNavigate,
  type NavigateFunction,
} from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type {
  RedactionResult,
  RedactionSegment,
  Replacement,
} from '../../api/types';
import { useApi, useMatchmaking } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { cx } from '../../ui/cx';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { FlowSteps } from './FlowSteps';
import styles from './PreviewScreen.module.css';

/** Polish plural of "informacja" in the accusative, for the banner. */
function informationWord(count: number): string {
  const lastTwo: number = count % 100;
  const last: number = count % 10;
  if (count === 1) {
    return 'informację';
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return 'informacje';
  }
  return 'informacji';
}

export function PreviewScreen(): ReactElement {
  const api: HubApi = useApi();
  const { state, update } = useMatchmaking();
  const navigate: NavigateFunction = useNavigate();
  const { state: load, retry }: AsyncResult<RedactionResult> =
    useAsync<RedactionResult>(
      `redact:${state.description}`,
      (signal: AbortSignal): Promise<RedactionResult> =>
        api.redactDescription(state.description, signal),
    );

  if (!state.submitted) {
    return <Navigate to="/" replace />;
  }

  function toggle(id: string): void {
    update({
      restored: state.restored.includes(id)
        ? state.restored.filter((item: string): boolean => item !== id)
        : [...state.restored, id],
    });
  }

  function renderSegment(
    data: RedactionResult,
    segment: RedactionSegment,
    index: number,
  ): ReactElement | null {
    if (segment.kind === 'text') {
      return <span key={String(index)}>{segment.text}</span>;
    }
    const replacement: Replacement | undefined = data.replacements.find(
      (item: Replacement): boolean => item.id === segment.replacementId,
    );
    if (replacement === undefined) {
      return null;
    }
    if (state.restored.includes(replacement.id)) {
      return <span key={String(index)}>{replacement.original}</span>;
    }
    return (
      <span
        key={String(index)}
        className={cx(
          styles['mark'],
          !replacement.restorable && styles['markDanger'],
        )}
      >
        {replacement.icon} {replacement.inlineLabel}
      </span>
    );
  }

  return (
    <main className={styles['main']}>
      <FlowSteps current={2} />
      <div className={styles['intro']}>
        <h1 className={styles['title']}>Tak zobaczy to system</h1>
        <p className={styles['lead']}>
          Sprawdź, co zamieniliśmy. Jeśli coś jest potrzebne do wyszukania,
          możesz to przywrócić.
        </p>
      </div>
      {load.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['loading']}>
          <strong>Sprawdzamy, czy opis nie zawiera danych osobowych…</strong>
          <Skeleton width="96%" />
          <Skeleton width="88%" />
          <Skeleton width="92%" />
          <Skeleton width="60%" />
        </div>
      ) : null}
      {load.status === 'error' ? (
        <LoadError message={load.message} onRetry={retry} />
      ) : null}
      {load.status === 'ready' ? (
        <>
          <div role="status" className={styles['banner']}>
            <span className={styles['bannerMark']} aria-hidden="true">
              ✓
            </span>
            {load.data.replacements.length === 0
              ? 'Nie znaleźliśmy informacji, które mogą identyfikować osobę.'
              : `Usunęliśmy ${String(
                  load.data.replacements.length - state.restored.length,
                )} ${informationWord(
                  load.data.replacements.length - state.restored.length,
                )}, które mogą identyfikować osobę. Do wyszukiwania nie są potrzebne.`}
          </div>
          <div
            className={cx(
              styles['columns'],
              load.data.replacements.length === 0 && styles['single'],
            )}
          >
            <p className={styles['text']}>
              {load.data.segments.map(
                (segment: RedactionSegment, index: number): ReactElement | null =>
                  renderSegment(load.data, segment, index),
              )}
            </p>
            {load.data.replacements.length === 0 ? null : (
              <div className={styles['swaps']}>
                <strong className={styles['swapsTitle']}>
                  Zamiany ({String(load.data.replacements.length)})
                </strong>
                <ul className={styles['swapList']}>
                  {load.data.replacements.map(
                    (replacement: Replacement): ReactElement => {
                      const restored: boolean = state.restored.includes(
                        replacement.id,
                      );
                      return (
                        <li key={replacement.id} className={styles['swap']}>
                          <span className={styles['swapIcon']} aria-hidden="true">
                            {replacement.icon}
                          </span>
                          <div className={styles['swapText']}>
                            <span className={styles['swapTag']}>
                              {replacement.tag}
                            </span>
                            <span className={styles['swapKind']}>
                              {replacement.kind}
                            </span>
                          </div>
                          {replacement.restorable ? (
                            <Button
                              variant="neutral"
                              className={styles['swapButton']}
                              aria-label={
                                restored
                                  ? `Usuń ponownie ${replacement.tag}`
                                  : `Cofnij zamianę ${replacement.tag}`
                              }
                              onClick={(): void => {
                                toggle(replacement.id);
                              }}
                            >
                              {restored ? 'Usuń ponownie' : '↶ Cofnij'}
                            </Button>
                          ) : null}
                        </li>
                      );
                    },
                  )}
                </ul>
              </div>
            )}
          </div>
        </>
      ) : null}
      <div className={styles['actions']}>
        <Link to="/" className={buttonClass('secondary', 'lg')}>
          ← Wróć do edycji
        </Link>
        <Button
          size="lg"
          disabled={load.status !== 'ready'}
          onClick={(): void => {
            void navigate('/znajdz/doprecyzowanie');
          }}
        >
          Akceptuję, szukaj dalej →
        </Button>
      </div>
    </main>
  );
}
```

The banner's text is one string so the tests can match it exactly. The inline
marker text must render as `● OSOBA_A` (icon, one space, label) inside a single
`span`.

- [ ] **Step 5: Register the routes**

In `src/app/routes.tsx`, import both screens and add, before the `*` entry of
the `PublicLayout` children:

```tsx
          { index: true, element: <StartScreen /> },
          { path: 'znajdz/podglad', element: <PreviewScreen /> },
```

- [ ] **Step 6: Run the tests, look at it, commit**

Run: `npx vitest run src/features/matchmaking` — Expected: PASS (9 tests).
The shell tests still pass because they use `/nabory`.

Run `npm run dev` and compare `/` and `/znajdz/podglad` with
`M1-Start.dc.html` and `M2-Podglad.dc.html` at 1440px and at 1024px, including
the error state (submit a short text) and the loading skeleton.

```bash
npm run format && npm run check
git add -A frontend/src
git commit -m "feat: add matchmaking start and anonymisation preview screens"
```

---

### Task 9: Matchmaking — M3 problem card, M4 results

**Files:**
- Create in `src/features/matchmaking/`: `ProblemCardScreen.tsx`, `ProblemCardEditor.tsx`, `ProblemCardScreen.module.css`, `ResultsScreen.tsx`, `MatchReason.tsx`, `LocalStatsPanel.tsx`, `ResultsScreen.module.css`
- Modify: `src/app/routes.tsx`, `src/features/matchmaking/matchmaking.test.tsx`
- Mockups: `M3-KartaProblemu.dc.html`, `M4-Wyniki.dc.html`

**Interfaces:**
- Consumes: Task 8's context usage and `FlowSteps`.
- Produces: `ProblemCardScreen`, `ResultsScreen`. M4 links to `/innowacje/:id`, which Task 10 adds.

**Contract — M3**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | Sprawdź, czy dobrze rozumiemy | |
| summary paragraph | starts with bold "Rozumiem, że" | shows the summary |
| button | Popraw streszczenie | swaps the paragraph for a `textarea` named "Streszczenie" and a button "Zapisz streszczenie" |
| chip remove button | `Usuń <chip>` | removes that chip from its group |
| button per group | `Dodaj: <group label>` (visible text "+ Dodaj") | swaps itself for an `input` named `Nowy element: <group label>`; Enter adds a non-empty, non-duplicate chip; Escape cancels |
| question | `role="group"` named by the question title | options are `ChoiceChip`s, single-select |
| button per question | `Pomiń: <question title>` (visible text "Pomiń") | clears that question's answer |
| button | Szukaj rozwiązań → | saves card and answers to context, goes to `/znajdz/wyniki` |
| link | ← Wróć | to `/znajdz/podglad` |

**Contract — M4**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | Rozwiązania dla Twojego problemu | |
| link | Zmień opis | to `/` |
| switch | Pokaż, jak system dopasował | stub |
| one `<article>` per match | contains an `h3` with the innovation name | |
| toggle buttons per card | `Przydatne: <name>`, `Nieprzydatne: <name>` (visible "✓ Przydatne", "✕ Nieprzydatne") | `aria-pressed`; mutually exclusive; pressing the active one clears it |
| link per card | `Zobacz szczegóły: <name>` (visible "Zobacz szczegóły →") | to `/innowacje/<innovationId>` |
| button | Przekaż problem do Hubu | stub |
| link per similar problem | `<source> ↗` | to `/innowacje/<innovationId>` |

No element other than a match card uses `<article>` on M4.

- [ ] **Step 1: Add the failing tests**

Append to `src/features/matchmaking/matchmaking.test.tsx` (add `within` to the
`@testing-library/react` import):

```tsx
async function reachProblemCard(user: UserEvent): Promise<void> {
  await user.click(screen.getByRole('button', { name: 'Dalej →' }));
  await screen.findByText('Zamiany (5)');
  await user.click(
    screen.getByRole('button', { name: 'Akceptuję, szukaj dalej →' }),
  );
  await screen.findByRole('button', { name: 'Usuń samotność' });
}

describe('M3 problem card', (): void => {
  it('shows the AI summary, chips and suggested answers', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Sprawdź, czy dobrze rozumiemy',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Sugestia AI, do weryfikacji')).toBeInTheDocument();
    const question: HTMLElement = screen.getByRole('group', {
      name: 'Kto miałby wdrażać?',
    });
    expect(
      within(question).getByRole('button', { name: 'Gmina z NGO' }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('removes and adds chips', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(screen.getByRole('button', { name: 'Usuń brak transportu' }));
    expect(screen.queryByText('brak transportu')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Dodaj: Problem' }));
    await user.type(
      screen.getByRole('textbox', { name: 'Nowy element: Problem' }),
      'brak opieki{Enter}',
    );
    expect(screen.getByRole('button', { name: 'Usuń brak opieki' })).toBeInTheDocument();
  });

  it('selects one answer per question and can skip', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    const question: HTMLElement = screen.getByRole('group', {
      name: 'Kto miałby wdrażać?',
    });
    await user.click(within(question).getByRole('button', { name: 'NGO' }));
    expect(within(question).getByRole('button', { name: 'NGO' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(
      within(question).getByRole('button', { name: 'Gmina z NGO' }),
    ).toHaveAttribute('aria-pressed', 'false');
    await user.click(
      screen.getByRole('button', { name: 'Pomiń: Kto miałby wdrażać?' }),
    );
    expect(within(question).getByRole('button', { name: 'NGO' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('edits the summary in place', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachProblemCard(user);
    await user.click(screen.getByRole('button', { name: 'Popraw streszczenie' }));
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Streszczenie',
    });
    await user.clear(field);
    await user.type(field, 'seniorzy są samotni.');
    await user.click(screen.getByRole('button', { name: 'Zapisz streszczenie' }));
    expect(screen.getByText(/seniorzy są samotni\./)).toBeInTheDocument();
  });
});

describe('M4 results', (): void => {
  async function reachResults(user: UserEvent): Promise<void> {
    await reachProblemCard(user);
    await user.click(screen.getByRole('button', { name: 'Szukaj rozwiązań →' }));
    await screen.findByRole('heading', {
      level: 3,
      name: 'Sąsiedzkie Telefony Życzliwości',
    });
  }

  it('shows three matches with their reasons, similar problems and local stats', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachResults(user);
    expect(
      screen.getByRole('heading', {
        level: 1,
        name: 'Rozwiązania dla Twojego problemu',
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(3);
    expect(
      await screen.findByText(/Wolontariusze dzwonią codziennie/),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Spotkania przyjeżdżają/)).toBeInTheDocument();
    expect(await screen.findByText(/Młodzież uczy seniorów/)).toBeInTheDocument();
    expect(
      screen.getByText(/Starsze osoby we wsiach bez komunikacji publicznej/),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Osoby 65+ mieszkające samotnie'),
    ).toBeInTheDocument();
  });

  it('keeps the feedback buttons mutually exclusive', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachResults(user);
    const useful: HTMLElement = screen.getByRole('button', {
      name: 'Przydatne: Cyfrowy Wnuk',
    });
    const useless: HTMLElement = screen.getByRole('button', {
      name: 'Nieprzydatne: Cyfrowy Wnuk',
    });
    await user.click(useful);
    expect(useful).toHaveAttribute('aria-pressed', 'true');
    await user.click(useless);
    expect(useful).toHaveAttribute('aria-pressed', 'false');
    expect(useless).toHaveAttribute('aria-pressed', 'true');
  });

  it('redirects to the start when opened without a description', (): void => {
    const { router } = renderApp('/znajdz/wyniki');
    expect(router.state.location.pathname).toBe('/');
  });
});
```

Run: `npx vitest run src/features/matchmaking` — Expected: the new tests FAIL.

- [ ] **Step 2: Implement M3**

`ProblemCardScreen.tsx` loads the card and guards the route; the editor holds
the editable copy, so it mounts only once data exists and needs no effect.

`src/features/matchmaking/ProblemCardScreen.tsx`:

```tsx
import type { ReactElement } from 'react';
import {
  Navigate,
  useNavigate,
  type NavigateFunction,
} from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type { ProblemCard } from '../../api/types';
import { useApi, useMatchmaking } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { FlowSteps } from './FlowSteps';
import { ProblemCardEditor } from './ProblemCardEditor';
import styles from './ProblemCardScreen.module.css';

export function ProblemCardScreen(): ReactElement {
  const api: HubApi = useApi();
  const { state, update } = useMatchmaking();
  const navigate: NavigateFunction = useNavigate();
  const { state: load, retry }: AsyncResult<ProblemCard> = useAsync<ProblemCard>(
    `summary:${state.description}`,
    (signal: AbortSignal): Promise<ProblemCard> =>
      state.card === null
        ? api.summariseProblem(
            {
              description: state.description,
              municipality: state.municipality,
              onBehalf: state.onBehalf,
            },
            signal,
          )
        : Promise.resolve(state.card),
  );

  if (!state.submitted) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className={styles['main']}>
      <FlowSteps current={3} />
      <h1 className={styles['title']}>Sprawdź, czy dobrze rozumiemy</h1>
      {load.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['loading']}>
          <strong>Przygotowujemy streszczenie…</strong>
          <Skeleton width="94%" height="1.375rem" />
          <Skeleton width="80%" height="1.375rem" />
          <div className={styles['loadingChips']}>
            <Skeleton width="9.375rem" height="2.75rem" />
            <Skeleton width="7.5rem" height="2.75rem" />
            <Skeleton width="10.625rem" height="2.75rem" />
          </div>
        </div>
      ) : null}
      {load.status === 'error' ? (
        <LoadError message={load.message} onRetry={retry} />
      ) : null}
      {load.status === 'ready' ? (
        <ProblemCardEditor
          initial={load.data}
          initialAnswers={state.answers}
          onConfirm={(
            card: ProblemCard,
            answers: Readonly<Record<string, string | null>>,
          ): void => {
            update({ card, answers });
            void navigate('/znajdz/wyniki');
          }}
        />
      ) : null}
    </main>
  );
}
```

`src/features/matchmaking/ProblemCardEditor.tsx` — state and handlers in full;
write the JSX from the `sc-if isDefault` block of `M3-KartaProblemu.dc.html`
and the M3 contract, including the action row ("Szukaj rozwiązań →" calls
`confirm`, "← Wróć" is a `Link` styled `buttonClass('link')`):

```tsx
interface ProblemCardEditorProps {
  readonly initial: ProblemCard;
  readonly initialAnswers: Readonly<Record<string, string | null>>;
  readonly onConfirm: (
    card: ProblemCard,
    answers: Readonly<Record<string, string | null>>,
  ) => void;
}

function startingAnswers(
  card: ProblemCard,
  saved: Readonly<Record<string, string | null>>,
): Record<string, string | null> {
  const answers: Record<string, string | null> = {};
  for (const question of card.questions) {
    answers[question.id] =
      question.id in saved ? (saved[question.id] ?? null) : question.suggested;
  }
  return answers;
}

export function ProblemCardEditor({
  initial,
  initialAnswers,
  onConfirm,
}: ProblemCardEditorProps): ReactElement {
  const [summary, setSummary] = useState<string>(initial.summary);
  const [draftSummary, setDraftSummary] = useState<string | null>(null);
  const [groups, setGroups] = useState<readonly ChipGroup[]>(initial.groups);
  const [adding, setAdding] = useState<string | null>(null);
  const [newChip, setNewChip] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string | null>>(
    (): Record<string, string | null> =>
      startingAnswers(initial, initialAnswers),
  );

  function removeChip(groupId: string, chip: string): void {
    setGroups((current: readonly ChipGroup[]): readonly ChipGroup[] =>
      current.map(
        (group: ChipGroup): ChipGroup =>
          group.id === groupId
            ? {
                ...group,
                chips: group.chips.filter(
                  (item: string): boolean => item !== chip,
                ),
              }
            : group,
      ),
    );
  }

  function addChip(groupId: string): void {
    const value: string = newChip.trim();
    if (value !== '') {
      setGroups((current: readonly ChipGroup[]): readonly ChipGroup[] =>
        current.map(
          (group: ChipGroup): ChipGroup =>
            group.id === groupId && !group.chips.includes(value)
              ? { ...group, chips: [...group.chips, value] }
              : group,
        ),
      );
    }
    setAdding(null);
    setNewChip('');
  }

  function answer(questionId: string, option: string | null): void {
    setAnswers(
      (current: Record<string, string | null>): Record<string, string | null> => ({
        ...current,
        [questionId]: option,
      }),
    );
  }

  function confirm(): void {
    onConfirm({ ...initial, summary, groups }, answers);
  }

  // JSX: see the mockup and the contract. `draftSummary !== null` means the
  // summary is being edited; "Zapisz streszczenie" does
  // `setSummary(draftSummary.trim()); setDraftSummary(null);`.
  // The chip input handles keys with:
  //   onKeyDown={(event: KeyboardEvent<HTMLInputElement>): void => {
  //     if (event.key === 'Enter') { event.preventDefault(); addChip(group.id); }
  //     if (event.key === 'Escape') { setAdding(null); setNewChip(''); }
  //   }}
  // A selected option is `answers[question.id] === option`; clicking it calls
  // `answer(question.id, option)`.
}
```

The chip input gets `autoFocus`.

- [ ] **Step 3: Implement M4**

`src/features/matchmaking/MatchReason.tsx`:

```tsx
import type { ReactElement } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { ReasonSegment } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { AiBadge } from '../../ui/AiBadge';
import { Skeleton } from '../../ui/Skeleton';
import styles from './ResultsScreen.module.css';

interface MatchReasonProps {
  readonly innovationId: string;
}

export function MatchReason({ innovationId }: MatchReasonProps): ReactElement {
  const api: HubApi = useApi();
  const { state }: AsyncResult<readonly ReasonSegment[]> = useAsync<
    readonly ReasonSegment[]
  >(
    `reason:${innovationId}`,
    (signal: AbortSignal): Promise<readonly ReasonSegment[]> =>
      api.getMatchReason(innovationId, signal),
  );

  if (state.status !== 'ready') {
    return (
      <div className={styles['reason']} role="status" aria-live="polite">
        <span className={styles['reasonPending']}>
          {state.status === 'error'
            ? 'Nie udało się przygotować uzasadnienia.'
            : 'Dlaczego pasuje — piszemy uzasadnienie…'}
        </span>
        {state.status === 'loading' ? (
          <>
            <Skeleton width="90%" height="1.125rem" />
            <Skeleton width="70%" height="1.125rem" />
          </>
        ) : null}
      </div>
    );
  }

  return (
    <div className={styles['reason']}>
      <div className={styles['reasonHead']}>
        <strong>Dlaczego pasuje</strong>
        <AiBadge />
        <span className={styles['reasonNote']}>Sugestia AI, do weryfikacji</span>
      </div>
      <p className={styles['reasonText']}>
        {state.data.map(
          (segment: ReasonSegment, index: number): ReactElement =>
            segment.highlight ? (
              <mark key={String(index)} className={styles['highlight']}>
                {segment.text}
              </mark>
            ) : (
              <span key={String(index)}>{segment.text}</span>
            ),
        )}
      </p>
    </div>
  );
}
```

`src/features/matchmaking/LocalStatsPanel.tsx` — renders section 3 of the M4
aside. Logic:

```tsx
interface LocalStatsPanelProps {
  readonly municipality: string;
}

export function LocalStatsPanel({
  municipality,
}: LocalStatsPanelProps): ReactElement {
  const api: HubApi = useApi();
  const { state, retry }: AsyncResult<LocalStats> = useAsync<LocalStats>(
    `local-stats:${municipality}`,
    (signal: AbortSignal): Promise<LocalStats> =>
      api.getLocalStats(municipality, signal),
  );
  // heading "3. Skala w Twojej gminie"
  // loading: three <Skeleton />; error: <LoadError />
  // ready: per stat a <strong>{stat.label}</strong> and per row a grid of
  //   who · bar · value, where the bar's inner width is
  //   `${String((row.value / stat.max) * 100)}%` (inline style), the inner
  //   class is `barPrimary` when row.primary else `barOther`, and the value
  //   renders as `${String(row.value)}%`; then the source line.
}
```

`src/features/matchmaking/ResultsScreen.tsx` — logic in full; JSX from
`M4-Wyniki.dc.html` and the M4 contract:

```tsx
type Feedback = 'useful' | 'useless';

const BANDS: Readonly<
  Record<MatchBand, { readonly label: string; readonly dots: string }>
> = {
  strong: { label: 'Silne dopasowanie', dots: '●●●' },
  medium: { label: 'Średnie dopasowanie', dots: '●●○' },
  weak: { label: 'Słabe dopasowanie', dots: '●○○' },
};

export function ResultsScreen(): ReactElement {
  const api: HubApi = useApi();
  const { state } = useMatchmaking();
  const { stub } = useToast();
  const [feedback, setFeedback] = useState<Readonly<Record<string, Feedback>>>(
    {},
  );
  const card: ProblemCard | null = state.card;
  const { state: load, retry }: AsyncResult<MatchResults> =
    useAsync<MatchResults>(
      `matches:${state.description}`,
      (signal: AbortSignal): Promise<MatchResults> =>
        card === null
          ? Promise.reject(new Error('Brak karty problemu.'))
          : api.findMatches(card, signal),
    );

  if (!state.submitted) {
    return <Navigate to="/" replace />;
  }
  if (card === null) {
    return <Navigate to="/znajdz/doprecyzowanie" replace />;
  }

  function rate(innovationId: string, value: Feedback): void {
    setFeedback(
      (current: Readonly<Record<string, Feedback>>): Readonly<
        Record<string, Feedback>
      > => {
        const { [innovationId]: previous, ...rest } = current;
        return previous === value ? rest : { ...rest, [innovationId]: value };
      },
    );
  }

  // JSX:
  // - header: h1, "Szukamy dla:" + load.data.searchTerms chips (when ready),
  //   <Link to="/">Zmień opis</Link>, <Switch checked={false} onChange={stub}>
  // - left section "1. Innowacje, które mogą pomóc" + "<n> wyniki":
  //     loading → role="status" "Szukamy innowacji…" and three skeleton cards
  //     error   → <LoadError message={load.message} onRetry={retry} />
  //     ready   → one <article> per card with: category, <h3>name</h3>,
  //               band pill (BANDS[card.band]; class `bandWeak` for 'weak'),
  //               fit tags ("✓ label" / "✗ label"),
  //               <MatchReason innovationId={card.innovationId} />,
  //               "✓ Zweryfikowano {verified}", "Koszt: {cost}",
  //               the two feedback buttons with
  //                 aria-pressed={feedback[card.innovationId] === 'useful'}
  //                 onClick={(): void => { rate(card.innovationId, 'useful'); }}
  //               and the details Link (class buttonClass('primary'))
  //   then the "Żadne nie pasuje?" box with the stub button
  // - aside: urgent-help box ("Znajdź swój OPS" is a stub button),
  //   "2. Podobne problemy" (when ready: count line + one <figure> per item),
  //   <LocalStatsPanel municipality={state.municipality} />
}
```

`rate` removes the entry when the same value is pressed again, which is what
makes the two buttons a clearable, mutually exclusive pair.

- [ ] **Step 4: Register the routes**

In `src/app/routes.tsx` add, after the `znajdz/podglad` entry:

```tsx
          { path: 'znajdz/doprecyzowanie', element: <ProblemCardScreen /> },
          { path: 'znajdz/wyniki', element: <ResultsScreen /> },
```

- [ ] **Step 5: Run the tests, look at it, commit**

Run: `npx vitest run src/features/matchmaking` — Expected: PASS (16 tests).

Compare `/znajdz/doprecyzowanie` and `/znajdz/wyniki` with the two mockups at
1440px and 1024px. On M4 confirm the three reasons appear one after another.

```bash
npm run format && npm run check
git add -A frontend/src
git commit -m "feat: add problem card and results screens"
```

---

### Task 10: Innovation card (Z2) and adaptation (MW1, MW2)

**Files:**
- Create: `src/features/innovation/InnovationScreen.tsx`, `InnovationScreen.module.css`
- Create in `src/features/adaptation/`: `ProfileScreen.tsx`, `ProfileScreen.module.css`, `DraftScreen.tsx`, `DraftScreen.module.css`, `useDraft.ts`, `profile.ts`
- Modify: `src/app/routes.tsx`
- Test: `src/features/adaptation/adaptation.test.tsx`, `src/features/adaptation/profile.test.ts`
- Mockups: `Z2-KartaInnowacji.dc.html`, `MW1-ProfilInstytucji.dc.html`, `MW2-SzkicUslugi.dc.html`

**Interfaces:**
- Consumes: `useAdaptation`, `useMatchmaking`, `useApi`, `useAsync`, `Stepper`, `ChoiceChip`, `BUDGET_OPTIONS`, `RESOURCE_OPTIONS`, `ProfileDraft`.
- Produces: `InnovationScreen`, `ProfileScreen`, `DraftScreen`; `parseProfile(draft: ProfileDraft): InstitutionProfile | null`; `profileSteps(draft: ProfileDraft): readonly StepItem[]`; `useDraft(innovationId: string, profile: InstitutionProfile | null): DraftState`.

**Contract — Z2**

| Element | Accessible name | Behaviour |
|---|---|---|
| link | ← Wróć do wyników | to `/znajdz/wyniki`; rendered only when `useMatchmaking().state.card !== null` |
| `h1` | the innovation name | |
| chip "◎ Szuka testerów" | | only when `seeksTesters`; blue border, red text, as drawn |
| link | Dostosuj do mojej gminy | to `/innowacje/<id>/dostosuj`, class `buttonClass('primary', 'lg')` |
| buttons | Zapytaj autora, Chcę testować, Oceń | stubs |
| `role="tablist"` with three `role="tab"` buttons | Opis, Finansowanie i wsparcie, `Opinie (<reviewCount>)` | `aria-selected`; switches the panel |
| `role="tabpanel"` | | "Opis": the drawn two-column layout. "Finansowanie i wsparcie": only that card, full width. "Opinie": only that card, full width |
| buttons | ▶ Odtwórz, Napisy PL, Transkrypcja, each material download | stubs |

Loading renders the mockup's `sc-if isLoading` skeleton; an unknown id renders
`LoadError` plus a `Link` "Wróć na stronę główną" to `/`.

**Contract — MW1**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | Opowiedz nam o swojej instytucji | |
| `Stepper` | Kroki | `profileSteps(draft)` |
| inputs | Gmina, Grupa odbiorców, Szacowana liczba odbiorców, Dostępna kadra | bound to `draft`; all are `type="text"` (the count uses `inputMode="numeric"`, not `type="number"`, so free text can be entered and rejected as drawn) |
| `role="group"` | Budżet na rok | `ChoiceChip`s from `BUDGET_OPTIONS`, single-select |
| `role="group"` | Zasoby i partnerzy | `ChoiceChip`s from `RESOURCE_OPTIONS`, multi-select |
| link | ← Wstecz | to `/innowacje/<id>` |
| submit button | Przygotuj szkic usługi → | validates; on success `update({ draft, submitted: true })` and go to `/innowacje/<id>/szkic` |
| error | `role="alert"`: "Wpisz liczbę, np. 40. Wystarczy przybliżenie." | shown when `parseProfile` returns null; field gets the danger border |
| link | Zmień innowację | to `/znajdz/wyniki` |

The right column shows the selected innovation (`getInnovation`) and the
municipality facts (`getMunicipalityFacts`), each with its own `useAsync`.
Every change calls `update({ draft })` so the form survives navigation; show
"Zapisano automatycznie" as static text.

**Contract — MW2**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | `<innovation name> w gminie <municipality>` | |
| `nav` | Sekcje szkicu | one link per section that has arrived, `href="#<section.id>"` |
| each section | `<section id={section.id}>` with an `h2` | `text` sections show the paragraph; `schedule` and `costs` render as drawn |
| button per text section | `Edytuj: <heading>` (visible "✎ Edytuj") | swaps the paragraph for a `textarea` named `Treść: <heading>` and buttons "Zapisz" and "Anuluj" |
| pending placeholder | `role="status"`: `Piszemy sekcję „<next heading>”…` and `Pozostało: <headings after it>` | while the draft is still arriving |
| button | Przenieś do wniosku →, ↓ Pobierz PDF dla kierownika, Zapytaj autora, Zapytaj eksperta | stubs |
| list | Założenia, na których opiera się szkic | built from the profile, see below |
| link | Zmień dane gminy | to `/innowacje/<id>/dostosuj` |

Assumptions list, in order: `Gmina <municipality>`, `<recipients> odbiorców`,
`Budżet <budget> / rok`, `Zasoby i partnerzy: <resources joined by ", ">`
(or `Brak wskazanych zasobów`), and `Brak własnego transportu` when
`Transport` is not among the resources.

The six headings, in order, are: Zakres usługi, Odbiorcy, Kadra, Harmonogram,
Koszty (widełki na rok), Ryzyka. The pending placeholder needs them before
they arrive, so `DraftScreen` keeps this list as a constant `SECTION_HEADINGS`.

- [ ] **Step 1: Write the failing unit tests for the profile helpers**

`src/features/adaptation/profile.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { EXAMPLE_PROFILE, type ProfileDraft } from '../../api/examples';
import { parseProfile, profileSteps } from './profile';

describe('parseProfile', (): void => {
  it('turns a valid draft into a profile', (): void => {
    expect(parseProfile(EXAMPLE_PROFILE)).toEqual({
      municipality: 'Jodłowa Wola',
      audience: 'Seniorzy 65+ mieszkający samotnie',
      recipients: 40,
      budget: '10–30 tys. zł',
      staff: '1 pracownik socjalny na część etatu, asystent rodziny',
      resources: ['Lokal (świetlica)', 'KGW', 'OSP', 'Szkoła'],
    });
  });

  it.each(['około czterdziestu', '', '0', '-3', '4.5'])(
    'rejects %j as a recipient count',
    (recipients: string): void => {
      const draft: ProfileDraft = { ...EXAMPLE_PROFILE, recipients };
      expect(parseProfile(draft)).toBeNull();
    },
  );
});

describe('profileSteps', (): void => {
  it('marks the last step current when everything is filled', (): void => {
    expect(
      profileSteps(EXAMPLE_PROFILE).map((step) => step.state),
    ).toEqual(['done', 'done', 'done', 'done', 'current']);
  });

  it('marks the first empty group current and later ones todo', (): void => {
    const draft: ProfileDraft = { ...EXAMPLE_PROFILE, budget: '', staff: '' };
    expect(profileSteps(draft).map((step) => step.state)).toEqual([
      'done',
      'done',
      'current',
      'todo',
      'done',
    ]);
  });
});
```

Run: `npx vitest run src/features/adaptation/profile.test.ts` — Expected: FAIL.

- [ ] **Step 2: Implement the profile helpers**

`src/features/adaptation/profile.ts`:

```ts
import type { ProfileDraft } from '../../api/examples';
import type { InstitutionProfile } from '../../api/types';
import type { StepItem } from '../../ui/Stepper';

/** Returns null when the recipient count is not a positive whole number. */
export function parseProfile(draft: ProfileDraft): InstitutionProfile | null {
  const raw: string = draft.recipients.trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    return null;
  }
  return {
    municipality: draft.municipality.trim(),
    audience: draft.audience.trim(),
    recipients: Number(raw),
    budget: draft.budget,
    staff: draft.staff.trim(),
    resources: draft.resources,
  };
}

export function profileSteps(draft: ProfileDraft): readonly StepItem[] {
  const groups: readonly (readonly [string, boolean])[] = [
    ['Gmina', draft.municipality.trim() !== ''],
    ['Odbiorcy', draft.audience.trim() !== '' && draft.recipients.trim() !== ''],
    ['Budżet', draft.budget !== ''],
    ['Kadra', draft.staff.trim() !== ''],
    ['Zasoby', draft.resources.length > 0],
  ];
  const firstEmpty: number = groups.findIndex(
    ([, filled]: readonly [string, boolean]): boolean => !filled,
  );
  const current: number = firstEmpty === -1 ? groups.length - 1 : firstEmpty;
  return groups.map(
    ([label, filled]: readonly [string, boolean], index: number): StepItem => {
      const numbered: string = `${String(index + 1)}. ${label}`;
      if (index === current) {
        return { label: `${numbered} · teraz`, state: 'current' };
      }
      return { label: numbered, state: filled ? 'done' : 'todo' };
    },
  );
}
```

Run the test — Expected: PASS (8 tests).

- [ ] **Step 3: Write the failing integration tests**

`src/features/adaptation/adaptation.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../test/renderApp';

const CARD: string = '/innowacje/telefony-zyczliwosci';

describe('Z2 innovation card', (): void => {
  it('shows the card and switches tabs', async (): Promise<void> => {
    const { user } = renderApp(CARD);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzkie Telefony Życzliwości',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Co mówi źródło')).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: '← Wróć do wyników' }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Opinie (12)' }));
    expect(screen.getByRole('tab', { name: 'Opinie (12)' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.queryByText('Co mówi źródło')).not.toBeInTheDocument();
    expect(
      screen.getByText(/Ruszyliśmy w miesiąc\. Seniorzy czekają na telefon/),
    ).toBeInTheDocument();
  });

  it('reports an unknown innovation', async (): Promise<void> => {
    renderApp('/innowacje/nie-ma-takiej');
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie znaleziono innowacji.',
    );
  });
});

describe('adaptation', (): void => {
  it('asks to sign in, then drafts the service for the entered municipality', async (): Promise<void> => {
    const { user } = renderApp(CARD);
    await user.click(
      await screen.findByRole('link', { name: 'Dostosuj do mojej gminy' }),
    );
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wybierz osobę' })).getByRole(
        'button',
        { name: /Ewa W\./ },
      ),
    );
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Opowiedz nam o swojej instytucji',
      }),
    ).toBeInTheDocument();

    const municipality: HTMLElement = screen.getByRole('textbox', {
      name: 'Gmina',
    });
    await user.clear(municipality);
    await user.type(municipality, 'Lipnica');
    await user.click(
      within(screen.getByRole('group', { name: 'Zasoby i partnerzy' })).getByRole(
        'button',
        { name: 'Transport' },
      ),
    );
    await user.click(
      screen.getByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzkie Telefony Życzliwości w gminie Lipnica',
      }),
    ).toBeInTheDocument();
    for (const heading of [
      'Zakres usługi',
      'Odbiorcy',
      'Kadra',
      'Harmonogram',
      'Koszty (widełki na rok)',
      'Ryzyka',
    ]) {
      expect(
        await screen.findByRole('heading', { level: 2, name: heading }),
      ).toBeInTheDocument();
    }
    const assumptions: HTMLElement = screen.getByRole('list', {
      name: 'Założenia, na których opiera się szkic',
    });
    expect(within(assumptions).getByText('Gmina Lipnica')).toBeInTheDocument();
    expect(within(assumptions).getByText('40 odbiorców')).toBeInTheDocument();
    expect(
      within(assumptions).queryByText('Brak własnego transportu'),
    ).not.toBeInTheDocument();
  });

  it('rejects a recipient count that is not a number', async (): Promise<void> => {
    const { user, router } = renderApp(`${CARD}/dostosuj`, { persona: 'ewa' });
    const recipients: HTMLElement = await screen.findByRole('textbox', {
      name: 'Szacowana liczba odbiorców',
    });
    await user.clear(recipients);
    await user.type(recipients, 'około czterdziestu');
    await user.click(
      screen.getByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Wpisz liczbę, np. 40. Wystarczy przybliżenie.',
    );
    expect(router.state.location.pathname).toBe(`${CARD}/dostosuj`);
  });

  it('edits a draft section in place', async (): Promise<void> => {
    const { user } = renderApp(`${CARD}/dostosuj`, { persona: 'ewa' });
    await user.click(
      await screen.findByRole('button', { name: 'Przygotuj szkic usługi →' }),
    );
    await user.click(
      await screen.findByRole('button', { name: 'Edytuj: Odbiorcy' }),
    );
    const field: HTMLElement = screen.getByRole('textbox', {
      name: 'Treść: Odbiorcy',
    });
    await user.clear(field);
    await user.type(field, 'Około 25 osób.');
    await user.click(screen.getByRole('button', { name: 'Zapisz' }));
    expect(screen.getByText('Około 25 osób.')).toBeInTheDocument();
  });

  it('sends a visitor without a profile back to the profile form', async (): Promise<void> => {
    const { router } = renderApp(`${CARD}/szkic`, { persona: 'ewa' });
    await screen.findByRole('heading', {
      level: 1,
      name: 'Opowiedz nam o swojej instytucji',
    });
    expect(router.state.location.pathname).toBe(`${CARD}/dostosuj`);
  });
});
```

Run: `npx vitest run src/features/adaptation` — Expected: the integration tests FAIL.

- [ ] **Step 4: Implement Z2**

`src/features/innovation/InnovationScreen.tsx` — logic in full, JSX from the
mockup and the Z2 contract:

```tsx
type Tab = 'opis' | 'finansowanie' | 'opinie';

export function InnovationScreen(): ReactElement {
  const { id = '' } = useParams();
  const api: HubApi = useApi();
  const { state: matchmaking } = useMatchmaking();
  const { stub } = useToast();
  const [tab, setTab] = useState<Tab>('opis');
  const { state: load, retry }: AsyncResult<Innovation> = useAsync<Innovation>(
    `innovation:${id}`,
    (signal: AbortSignal): Promise<Innovation> => api.getInnovation(id, signal),
  );
  // loading → the mockup's skeleton in <main role="status" aria-live="polite">
  // error   → <main><LoadError message={load.message} onRetry={retry} />
  //           <Link to="/">Wróć na stronę główną</Link></main>
  // ready   → header, sticky action bar, tablist, tabpanel.
  //   Tabs: three <button type="button" role="tab" aria-selected={tab === '…'}>
  //   Panel: tab === 'opis' renders both columns; the other two render only
  //   their card.
}
```

- [ ] **Step 5: Implement MW1**

`src/features/adaptation/ProfileScreen.tsx` — logic in full, JSX from the
mockup and the MW1 contract:

```tsx
export function ProfileScreen(): ReactElement {
  const { id = '' } = useParams();
  const api: HubApi = useApi();
  const { state, update } = useAdaptation();
  const navigate: NavigateFunction = useNavigate();
  const [invalid, setInvalid] = useState<boolean>(false);
  const draft: ProfileDraft = state.draft;
  const innovation: AsyncResult<Innovation> = useAsync<Innovation>(
    `innovation:${id}`,
    (signal: AbortSignal): Promise<Innovation> => api.getInnovation(id, signal),
  );
  const facts: AsyncResult<MunicipalityFacts> = useAsync<MunicipalityFacts>(
    'municipality-facts',
    (signal: AbortSignal): Promise<MunicipalityFacts> =>
      api.getMunicipalityFacts(draft.municipality, signal),
  );

  function change(patch: Partial<ProfileDraft>): void {
    update({ draft: { ...draft, ...patch } });
    setInvalid(false);
  }

  function toggleResource(resource: string): void {
    change({
      resources: draft.resources.includes(resource)
        ? draft.resources.filter((item: string): boolean => item !== resource)
        : [...draft.resources, resource],
    });
  }

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    if (parseProfile(draft) === null) {
      setInvalid(true);
      return;
    }
    update({ draft, submitted: true });
    void navigate(`/innowacje/${id}/szkic`);
  }
  // The budget chip for `option` is selected when `draft.budget === option`
  // and toggles with `change({ budget: draft.budget === option ? '' : option })`.
}
```

The facts request uses a constant key on purpose: the mock ignores the
municipality, and reloading the panel on every keystroke would flicker.

- [ ] **Step 6: Implement MW2**

`src/features/adaptation/useDraft.ts`:

```ts
import { useEffect, useState } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { DraftSection, InstitutionProfile } from '../../api/types';
import { useApi } from '../../app/contexts';

export interface DraftState {
  readonly sections: readonly DraftSection[];
  readonly done: boolean;
  readonly failed: boolean;
}

interface Progress extends DraftState {
  readonly token: string;
}

const EMPTY: DraftState = { sections: [], done: false, failed: false };

/** Collects the draft sections as the API yields them. */
export function useDraft(
  innovationId: string,
  profile: InstitutionProfile | null,
): DraftState {
  const api: HubApi = useApi();
  const token: string = `${innovationId}:${JSON.stringify(profile)}`;
  const [progress, setProgress] = useState<Progress | null>(null);

  useEffect((): (() => void) => {
    const controller: AbortController = new AbortController();

    async function run(target: InstitutionProfile): Promise<void> {
      const collected: DraftSection[] = [];
      try {
        for await (const section of api.draftService(
          innovationId,
          target,
          controller.signal,
        )) {
          if (controller.signal.aborted) {
            return;
          }
          collected.push(section);
          setProgress({
            token,
            sections: [...collected],
            done: false,
            failed: false,
          });
        }
        setProgress({ token, sections: collected, done: true, failed: false });
      } catch {
        if (!controller.signal.aborted) {
          setProgress({ token, sections: collected, done: false, failed: true });
        }
      }
    }

    if (profile !== null) {
      void run(profile);
    }
    return (): void => {
      controller.abort();
    };
    // `profile` is represented by `token`, which changes when it does.
  }, [api, innovationId, token]);

  return progress !== null && progress.token === token ? progress : EMPTY;
}
```

The effect reads `profile` but lists `token` instead. If the linter reports a
missing dependency, compute `profile` inside the effect from a `profileJson`
string: pass `JSON.stringify(profile)` in the dependency array and
`JSON.parse` it in the effect, and drop `token` from the array.

`src/features/adaptation/DraftScreen.tsx` — logic in full, JSX from the mockup
and the MW2 contract:

```tsx
const SECTION_HEADINGS: readonly string[] = [
  'Zakres usługi',
  'Odbiorcy',
  'Kadra',
  'Harmonogram',
  'Koszty (widełki na rok)',
  'Ryzyka',
];

function assumptions(profile: InstitutionProfile): readonly string[] {
  return [
    `Gmina ${profile.municipality}`,
    `${String(profile.recipients)} odbiorców`,
    `Budżet ${profile.budget} / rok`,
    profile.resources.length > 0
      ? `Zasoby i partnerzy: ${profile.resources.join(', ')}`
      : 'Brak wskazanych zasobów',
    ...(profile.resources.includes('Transport')
      ? []
      : ['Brak własnego transportu']),
  ];
}

export function DraftScreen(): ReactElement {
  const { id = '' } = useParams();
  const api: HubApi = useApi();
  const { state } = useAdaptation();
  const { stub } = useToast();
  const profile: InstitutionProfile | null = state.submitted
    ? parseProfile(state.draft)
    : null;
  const draft: DraftState = useDraft(id, profile);
  const innovation: AsyncResult<Innovation> = useAsync<Innovation>(
    `innovation:${id}`,
    (signal: AbortSignal): Promise<Innovation> => api.getInnovation(id, signal),
  );
  const [edits, setEdits] = useState<Readonly<Record<string, string>>>({});
  const [editing, setEditing] = useState<{
    readonly id: string;
    readonly text: string;
  } | null>(null);

  if (profile === null) {
    return <Navigate to={`/innowacje/${id}/dostosuj`} replace />;
  }

  const pending: readonly string[] = SECTION_HEADINGS.slice(
    draft.sections.length,
  );

  function save(): void {
    if (editing !== null) {
      setEdits(
        (current: Readonly<Record<string, string>>): Readonly<
          Record<string, string>
        > => ({ ...current, [editing.id]: editing.text.trim() }),
      );
      setEditing(null);
    }
  }
  // - A text section shows `edits[section.id] ?? section.text`.
  // - "Edytuj" does `setEditing({ id: section.id, text: edits[section.id] ?? section.text })`.
  // - The title is `${innovation name} w gminie ${profile.municipality}`; while
  //   the innovation loads, render the h1 with a <Skeleton /> in place of the name.
  // - While `!draft.done && !draft.failed && pending.length > 0`, render the
  //   placeholder: `Piszemy sekcję „${pending[0]}”…` and, when more remain,
  //   `Pozostało: ${pending.slice(1).join(', ')}`.
  // - `draft.failed` renders <FieldError>Nie udało się przygotować szkicu.</FieldError>.
  // - The assumptions <ul> has aria-label="Założenia, na których opiera się szkic".
  // - A schedule row places its bar with inline style
  //   `gridColumn: `${String(row.from + 1)} / ${String(row.to + 2)}``
  //   in a grid of `12.5rem repeat(6, minmax(0, 1fr))`; the tone picks the class
  //   `barPrepare`, `barRun` or `barReview`.
}
```

- [ ] **Step 7: Register the routes**

In `src/app/routes.tsx` add to the `PublicLayout` children, before `*`:

```tsx
          { path: 'innowacje/:id', element: <InnovationScreen /> },
          {
            path: 'innowacje/:id/dostosuj',
            element: (
              <RequirePersona role="user">
                <ProfileScreen />
              </RequirePersona>
            ),
          },
          {
            path: 'innowacje/:id/szkic',
            element: (
              <RequirePersona role="user">
                <DraftScreen />
              </RequirePersona>
            ),
          },
```

- [ ] **Step 8: Add the end of the matchmaking walk-through**

Append to the `M4 results` block of `matchmaking.test.tsx`:

```tsx
  it('opens the innovation card and returns to the results', async (): Promise<void> => {
    const { user } = renderApp('/');
    await reachResults(user);
    await user.click(
      screen.getByRole('link', {
        name: 'Zobacz szczegóły: Sąsiedzkie Telefony Życzliwości',
      }),
    );
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzkie Telefony Życzliwości',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: '← Wróć do wyników' }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Rozwiązania dla Twojego problemu',
      }),
    ).toBeInTheDocument();
  });
```

- [ ] **Step 9: Run the tests, look at it, commit**

Run: `npx vitest run src/features` — Expected: PASS.

Compare the three screens with their mockups at 1440px and 1024px, including
the MW1 error state and the MW2 section-by-section loading.

```bash
npm run format && npm run check
git add -A frontend/src
git commit -m "feat: add innovation card, institution profile and service draft"
```

---

### Task 11: Idea form (K1), my cases and the author's thread (C3)

**Files:**
- Create: `src/features/idea/IdeaScreen.tsx`, `IdeaScreen.module.css`, `src/features/idea/validateIdea.ts`
- Create in `src/features/thread/`: `useThread.ts`, `Composer.tsx`, `Composer.module.css`
- Create in `src/features/cases/`: `CasesScreen.tsx`, `CasesScreen.module.css`, `AuthorThreadScreen.tsx`, `AuthorThreadScreen.module.css`
- Modify: `src/app/routes.tsx`
- Test: `src/features/idea/validateIdea.test.ts`, `src/features/cases/cases.test.tsx`
- Mockups: `K1-Fiszka.dc.html`, `C3-Watek.dc.html` (the `sc-if isAuthor` block), `C1-Powiadomienia.dc.html` (the dimmed "Moje sprawy" list behind the popover)

**Interfaces:**
- Consumes: `useApi`, `useSession`, `useAsync`, `STATUS_VIEW`, `StatusPill`, `Stepper`, `EXAMPLE_IDEA`, `IDEA_STAGES`.
- Produces:
  - `validateIdea(form: IdeaForm): IdeaErrors` where `IdeaErrors = Partial<Record<'name' | 'summary' | 'audience' | 'problem' | 'email', string>>`
  - `useThread(caseId: string): { state: AsyncState<CaseThread>; retry: () => void; send: (from: PersonaId, text: string) => Promise<void> }`
  - `Composer({ label: string; sendLabel: string; onSend: (text: string) => Promise<void>; toolbar?: ReactNode })`
  - `IdeaScreen`, `CasesScreen`, `AuthorThreadScreen`

**Contract — K1**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | Zgłoś pomysł | |
| inputs | 1. Nazwa robocza; 2. Istota pomysłu w jednym zdaniu; 3. Dla kogo; 4. Jaki problem rozwiązuje; E-mail do odpowiedzi (opcjonalnie) | pre-filled from `EXAMPLE_IDEA`; the summary is a `textarea` with a live `<n> / 160 znaków` counter |
| `role="group"` | 5. Etap | `ChoiceChip`s from `IDEA_STAGES`, single-select, always one selected |
| button | + Dodaj plik | stub |
| submit button | Wyślij fiszkę | validates, then `submitIdea(form, persona?.id ?? null)`; disabled while sending |
| button | Rozwiń pomysł z asystentem | stub |
| preview card | under the text "Podgląd fiszki" | mirrors stage, name, summary, audience and problem live |
| errors | one `FieldError` under each failing field, linked with `aria-describedby` | |
| success `h1` | Fiszka wysłana. Dziękujemy! | with the case number, the name and the reply-by date |
| link (success) | Przejdź do Moich spraw | to `/moje-sprawy` |
| button (success) | Zgłoś kolejny pomysł | back to the form, reset to `EXAMPLE_IDEA` |

A failed submit shows `<FieldError>Nie udało się wysłać fiszki. Spróbuj ponownie.</FieldError>` above the buttons and keeps the form.

**Contract — Moje sprawy**

`h1` "Moje sprawy"; a `ul` with one `li` per case containing a `Link` named
`<type>: <title>` to `/moje-sprawy/<id>` and a `StatusPill`; when empty, the
text "Nie masz jeszcze żadnych spraw." and a `Link` "Zgłoś pomysł" to
`/zglos-pomysl`.

**Contract — C3 author view**

| Element | Accessible name | Behaviour |
|---|---|---|
| link | ← Moje sprawy | to `/moje-sprawy` |
| header | `Dotyczy: <type lower-cased> · <id>`, `StatusPill`, `h1` with the title | |
| `Stepper` | Postęp sprawy | see `timelineSteps` below |
| each message | `<article>` | name is "Ty" when `message.from === persona.id`, otherwise `message.authorName`; role tag; time; text. Messages not from the viewer are indented by `3rem` |
| `Composer` | label "Twoja odpowiedź", send "Wyślij" | sends as the current persona |

**Contract — Composer**

| Element | Accessible name | Behaviour |
|---|---|---|
| `textarea` | the `label` prop | placeholder "Napisz odpowiedź…" |
| send button | the `sendLabel` prop; "Spróbuj ponownie" after a failure | disabled when the trimmed text is empty or while sending |
| button | ⎘ Dołącz plik | stub |
| error | `role="alert"`: "Nie wysłano — brak połączenia. Tekst jest zapisany, spróbuj ponownie." | shown after `onSend` rejects; the text stays; the frame gets the danger border |

On success the textarea clears and the error disappears.

- [ ] **Step 1: Write the failing validation tests**

`src/features/idea/validateIdea.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { EXAMPLE_IDEA } from '../../api/examples';
import { validateIdea } from './validateIdea';

describe('validateIdea', (): void => {
  it('accepts the example idea', (): void => {
    expect(validateIdea(EXAMPLE_IDEA)).toEqual({});
  });

  it('accepts an empty e-mail', (): void => {
    expect(validateIdea({ ...EXAMPLE_IDEA, email: '' })).toEqual({});
  });

  it('requires the four text fields', (): void => {
    expect(
      validateIdea({
        ...EXAMPLE_IDEA,
        name: ' ',
        summary: '',
        audience: '',
        problem: '',
      }),
    ).toEqual({
      name: 'Podaj nazwę roboczą.',
      summary: 'Opisz pomysł w jednym zdaniu.',
      audience: 'Napisz, dla kogo jest pomysł.',
      problem: 'Napisz, jaki problem rozwiązuje.',
    });
  });

  it('limits the summary to 160 characters', (): void => {
    expect(
      validateIdea({ ...EXAMPLE_IDEA, summary: 'a'.repeat(161) }),
    ).toEqual({ summary: 'Skróć zdanie do 160 znaków.' });
  });

  it('rejects a malformed e-mail', (): void => {
    expect(validateIdea({ ...EXAMPLE_IDEA, email: 'm.nowak@' })).toEqual({
      email: 'Sprawdź adres e-mail, np. imie@przyklad.pl.',
    });
  });
});
```

Run: `npx vitest run src/features/idea` — Expected: FAIL.

- [ ] **Step 2: Implement the validation**

`src/features/idea/validateIdea.ts`:

```ts
import type { IdeaForm } from '../../api/types';

export type IdeaField = 'name' | 'summary' | 'audience' | 'problem' | 'email';
export type IdeaErrors = Partial<Record<IdeaField, string>>;

export const SUMMARY_LIMIT: number = 160;

const EMAIL: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateIdea(form: IdeaForm): IdeaErrors {
  const errors: IdeaErrors = {};
  if (form.name.trim() === '') {
    errors.name = 'Podaj nazwę roboczą.';
  }
  if (form.summary.trim() === '') {
    errors.summary = 'Opisz pomysł w jednym zdaniu.';
  } else if (form.summary.trim().length > SUMMARY_LIMIT) {
    errors.summary = 'Skróć zdanie do 160 znaków.';
  }
  if (form.audience.trim() === '') {
    errors.audience = 'Napisz, dla kogo jest pomysł.';
  }
  if (form.problem.trim() === '') {
    errors.problem = 'Napisz, jaki problem rozwiązuje.';
  }
  if (form.email.trim() !== '' && !EMAIL.test(form.email.trim())) {
    errors.email = 'Sprawdź adres e-mail, np. imie@przyklad.pl.';
  }
  return errors;
}
```

Run the test — Expected: PASS (5 tests).

- [ ] **Step 3: Write the failing integration tests**

`src/features/cases/cases.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EXAMPLE_IDEA } from '../../api/examples';
import { createMockApi } from '../../api/mock/createMockApi';
import { renderApp } from '../../test/renderApp';

function fixedNow(): Date {
  return new Date(2026, 9, 14, 9, 30);
}

describe('K1 idea form', (): void => {
  it('mirrors the form in the preview card', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl');
    const name: HTMLElement = screen.getByRole('textbox', {
      name: '1. Nazwa robocza',
    });
    await user.clear(name);
    await user.type(name, 'Klub filmowy');
    const preview: HTMLElement = screen.getByRole('region', {
      name: 'Podgląd fiszki',
    });
    expect(within(preview).getByText('Klub filmowy')).toBeInTheDocument();
    expect(
      screen.getByText(
        `${String(EXAMPLE_IDEA.summary.length)} / 160 znaków`,
      ),
    ).toBeInTheDocument();
  });

  it('shows field errors and does not send', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl');
    await user.clear(screen.getByRole('textbox', { name: '1. Nazwa robocza' }));
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Podaj nazwę roboczą.');
    expect(
      screen.queryByRole('heading', { name: 'Fiszka wysłana. Dziękujemy!' }),
    ).not.toBeInTheDocument();
  });

  it('sends the idea and shows the case number and reply date', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl', {
      api: createMockApi({ delayMs: 0, now: fixedNow }),
      persona: 'maria',
    });
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Fiszka wysłana. Dziękujemy!',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('HUB-2026-0143')).toBeInTheDocument();
    expect(screen.getByText('21 października 2026')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Przejdź do Moich spraw' }));
    // The seeded case and the one just sent share the example name.
    expect(
      await screen.findAllByRole('link', {
        name: 'Pomysł: Sąsiedzka kawiarenka',
      }),
    ).toHaveLength(2);
  });
});

describe('my cases and the author thread', (): void => {
  it('lists the persona cases with their status', async (): Promise<void> => {
    renderApp('/moje-sprawy', { persona: 'maria' });
    const items: HTMLElement[] = await screen.findAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Pomysł: Sąsiedzka kawiarenka');
    expect(items[0]).toHaveTextContent('Odpowiedziano');
  });

  it('shows the empty state to a curator', async (): Promise<void> => {
    renderApp('/moje-sprawy', { persona: 'anna' });
    expect(
      await screen.findByText('Nie masz jeszcze żadnych spraw.'),
    ).toBeInTheDocument();
  });

  it('shows the thread and appends a reply', async (): Promise<void> => {
    const { user } = renderApp('/moje-sprawy/HUB-2026-0142', {
      api: createMockApi({ delayMs: 0, now: fixedNow }),
      persona: 'maria',
    });
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Sąsiedzka kawiarenka',
      }),
    ).toBeInTheDocument();
    const messages: HTMLElement[] = screen.getAllByRole('article');
    expect(messages).toHaveLength(3);
    expect(messages[0]).toHaveTextContent('Ty');
    expect(messages[1]).toHaveTextContent('Anna Kowalczyk');

    const send: HTMLElement = screen.getByRole('button', { name: 'Wyślij' });
    expect(send).toBeDisabled();
    await user.type(
      screen.getByRole('textbox', { name: 'Twoja odpowiedź' }),
      'Mamy zgodę OSP na czwartki.',
    );
    await user.click(send);
    expect(await screen.findAllByRole('article')).toHaveLength(4);
    expect(screen.getByText('Mamy zgodę OSP na czwartki.')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Twoja odpowiedź' })).toHaveValue(
      '',
    );
  });

  it('keeps the draft and offers a retry when sending fails', async (): Promise<void> => {
    let online: boolean = false;
    const { user } = renderApp('/moje-sprawy/HUB-2026-0142', {
      api: createMockApi({ delayMs: 0, isOnline: (): boolean => online }),
      persona: 'maria',
    });
    const field: HTMLElement = await screen.findByRole('textbox', {
      name: 'Twoja odpowiedź',
    });
    await user.type(field, 'Dziękuję!');
    await user.click(screen.getByRole('button', { name: 'Wyślij' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie wysłano — brak połączenia. Tekst jest zapisany, spróbuj ponownie.',
    );
    expect(field).toHaveValue('Dziękuję!');
    online = true;
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(await screen.findAllByRole('article')).toHaveLength(4);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('reports an unknown case', async (): Promise<void> => {
    renderApp('/moje-sprawy/HUB-0000', { persona: 'maria' });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Nie znaleziono zgłoszenia.',
    );
  });
});
```

The preview card is a `<section aria-labelledby>` pointing at the "Podgląd
fiszki" text, which gives it the `region` role the first test selects.

Run: `npx vitest run src/features/cases` — Expected: FAIL.

- [ ] **Step 4: Implement the thread hook and the composer**

`src/features/thread/useThread.ts`:

```ts
import { useState } from 'react';

import type { HubApi } from '../../api/HubApi';
import type { CaseThread, PersonaId } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncState } from '../../app/useAsync';

export interface ThreadResult {
  readonly state: AsyncState<CaseThread>;
  readonly retry: () => void;
  readonly send: (from: PersonaId, text: string) => Promise<void>;
}

/** Loads a case thread and keeps the copy returned by the last send. */
export function useThread(caseId: string): ThreadResult {
  const api: HubApi = useApi();
  const [sent, setSent] = useState<CaseThread | null>(null);
  const { state, retry } = useAsync<CaseThread>(
    `case:${caseId}`,
    (signal: AbortSignal): Promise<CaseThread> => api.getCase(caseId, signal),
  );

  async function send(from: PersonaId, text: string): Promise<void> {
    setSent(await api.sendMessage(caseId, from, text));
  }

  const current: AsyncState<CaseThread> =
    state.status === 'ready' && sent !== null && sent.id === caseId
      ? { status: 'ready', data: sent }
      : state;

  return { state: current, retry, send };
}
```

`src/features/thread/Composer.tsx` (styles from the composer block of
`C3-Watek.dc.html`):

```tsx
import {
  useId,
  useState,
  type ChangeEvent,
  type ReactElement,
  type ReactNode,
} from 'react';

import { useToast } from '../../app/contexts';
import { Button } from '../../ui/Button';
import { cx } from '../../ui/cx';
import { FieldError } from '../../ui/FieldError';
import styles from './Composer.module.css';

interface ComposerProps {
  readonly label: string;
  readonly sendLabel: string;
  readonly onSend: (text: string) => Promise<void>;
  /** Extra control shown next to the label, e.g. the templates button. */
  readonly toolbar?: ReactNode;
}

export function Composer({
  label,
  sendLabel,
  onSend,
  toolbar,
}: ComposerProps): ReactElement {
  const id: string = useId();
  const { stub } = useToast();
  const [text, setText] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);

  async function send(): Promise<void> {
    setSending(true);
    try {
      await onSend(text.trim());
      setText('');
      setFailed(false);
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className={cx(styles['composer'], failed && styles['failed'])}>
      <div className={styles['head']}>
        <label htmlFor={id} className={styles['label']}>
          {label}
        </label>
        {toolbar}
      </div>
      {failed ? (
        <FieldError id={`${id}-error`}>
          Nie wysłano — brak połączenia. Tekst jest zapisany, spróbuj ponownie.
        </FieldError>
      ) : null}
      <textarea
        id={id}
        className={styles['field']}
        placeholder="Napisz odpowiedź…"
        value={text}
        aria-describedby={failed ? `${id}-error` : undefined}
        onChange={(event: ChangeEvent<HTMLTextAreaElement>): void => {
          setText(event.target.value);
        }}
      />
      <div className={styles['actions']}>
        <Button variant="neutral" onClick={stub}>
          ⎘ Dołącz plik
        </Button>
        <span className={styles['note']}>
          Rozmowa zostaje w HubMe. Nie używamy zewnętrznych komunikatorów.
        </span>
        <Button
          className={styles['send']}
          disabled={sending || text.trim() === ''}
          onClick={(): void => {
            void send();
          }}
        >
          {failed ? 'Spróbuj ponownie' : sendLabel}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Implement K1, the case list and the author thread**

`src/features/idea/IdeaScreen.tsx` — logic in full, JSX from `K1-Fiszka.dc.html`
and the K1 contract:

```tsx
export function IdeaScreen(): ReactElement {
  const api: HubApi = useApi();
  const { persona } = useSession();
  const { stub } = useToast();
  const [form, setForm] = useState<IdeaForm>(EXAMPLE_IDEA);
  const [errors, setErrors] = useState<IdeaErrors>({});
  const [sending, setSending] = useState<boolean>(false);
  const [failed, setFailed] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<SubmittedCase | null>(null);

  function change(patch: Partial<IdeaForm>): void {
    setForm((current: IdeaForm): IdeaForm => ({ ...current, ...patch }));
  }

  async function send(): Promise<void> {
    setSending(true);
    setFailed(false);
    try {
      setSubmitted(await api.submitIdea(form, persona?.id ?? null));
    } catch {
      setFailed(true);
    } finally {
      setSending(false);
    }
  }

  function submit(event: SyntheticEvent): void {
    event.preventDefault();
    const found: IdeaErrors = validateIdea(form);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      void send();
    }
  }

  function reset(): void {
    setForm(EXAMPLE_IDEA);
    setErrors({});
    setSubmitted(null);
  }
  // submitted !== null → the mockup's `sc-if isSuccess` block in
  //   <main role="status" aria-live="polite">, using submitted.id,
  //   submitted.title and submitted.replyBy.
  // otherwise → the form. The counter is
  //   `${String(form.summary.length)} / ${String(SUMMARY_LIMIT)} znaków`.
  // The "Teraz nie ma aktywnego naboru…" note is static text.
}
```

`src/features/cases/CasesScreen.tsx` — in full; write the CSS from the dimmed
list in `C1-Powiadomienia.dc.html` (page padding `2.25rem 3.5rem`, rows
`max-width: 47.5rem`):

```tsx
import type { ReactElement } from 'react';
import { Link } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import { STATUS_VIEW } from '../../api/status';
import type { CaseSummary, PersonaId } from '../../api/types';
import { useApi, useSession } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { buttonClass } from '../../ui/buttonClass';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import { StatusPill } from '../../ui/StatusPill';
import styles from './CasesScreen.module.css';

export function CasesScreen(): ReactElement {
  const api: HubApi = useApi();
  const { persona } = useSession();
  const personaId: PersonaId | null = persona?.id ?? null;
  const { state, retry }: AsyncResult<readonly CaseSummary[]> = useAsync<
    readonly CaseSummary[]
  >(
    `my-cases:${personaId ?? 'none'}`,
    (signal: AbortSignal): Promise<readonly CaseSummary[]> =>
      personaId === null
        ? Promise.resolve([])
        : api.listMyCases(personaId, signal),
  );

  return (
    <main className={styles['main']}>
      <h1 className={styles['title']}>Moje sprawy</h1>
      {state.status === 'loading' ? (
        <div role="status" aria-live="polite" className={styles['loading']}>
          <span className="visually-hidden">Wczytujemy sprawy…</span>
          <Skeleton height="4rem" />
          <Skeleton height="4rem" />
        </div>
      ) : null}
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : null}
      {state.status === 'ready' && state.data.length === 0 ? (
        <div className={styles['empty']}>
          <p>Nie masz jeszcze żadnych spraw.</p>
          <Link to="/zglos-pomysl" className={buttonClass('secondary')}>
            Zgłoś pomysł
          </Link>
        </div>
      ) : null}
      {state.status === 'ready' && state.data.length > 0 ? (
        <ul className={styles['list']}>
          {state.data.map(
            (item: CaseSummary): ReactElement => (
              <li key={item.id} className={styles['row']}>
                <Link
                  to={`/moje-sprawy/${item.id}`}
                  className={styles['link']}
                >
                  {item.type}: {item.title}
                </Link>
                <StatusPill
                  tone={STATUS_VIEW[item.status].tone}
                  icon={STATUS_VIEW[item.status].icon}
                >
                  {item.status}
                </StatusPill>
              </li>
            ),
          )}
        </ul>
      ) : null}
    </main>
  );
}
```

The link text must render as one string, `Pomysł: Sąsiedzka kawiarenka`.

`src/features/cases/AuthorThreadScreen.tsx` — logic in full, JSX from the
`sc-if isAuthor` block of `C3-Watek.dc.html` and the C3 author contract:

```tsx
function timelineSteps(thread: CaseThread): readonly StepItem[] {
  const { timeline } = thread;
  const reached: readonly (string | null)[] = [
    timeline.sent,
    timeline.inProgress,
    timeline.answered,
    timeline.closed,
  ];
  const labels: readonly string[] = [
    'Wysłane',
    'W trakcie',
    'Odpowiedziano',
    'Zamknięte',
  ];
  const last: number = reached.reduce(
    (found: number, date: string | null, index: number): number =>
      date === null ? found : index,
    0,
  );
  return labels.map((label: string, index: number): StepItem => {
    const date: string | null = reached[index] ?? null;
    return {
      label,
      note: date ?? '—',
      state: index < last ? 'done' : index === last ? 'current' : 'todo',
    };
  });
}

export function AuthorThreadScreen(): ReactElement {
  const { id = '' } = useParams();
  const { persona } = useSession();
  const { state, retry, send } = useThread(id);
  // loading → skeleton header and two skeleton messages in role="status"
  // error   → <LoadError /> and the "← Moje sprawy" link
  // ready   → header (with <Stepper label="Postęp sprawy" items={timelineSteps(state.data)} />),
  //           one <article> per message, then
  //           <Composer label="Twoja odpowiedź" sendLabel="Wyślij"
  //             onSend={(text: string): Promise<void> =>
  //               persona === null ? Promise.resolve() : send(persona.id, text)} />
}
```

`Stepper` prefixes done steps with "✓"; that matches the drawn timeline.

- [ ] **Step 6: Register the routes**

In `src/app/routes.tsx` add to the `PublicLayout` children, before `*`:

```tsx
          { path: 'zglos-pomysl', element: <IdeaScreen /> },
          {
            path: 'moje-sprawy',
            element: (
              <RequirePersona role="user">
                <CasesScreen />
              </RequirePersona>
            ),
          },
          {
            path: 'moje-sprawy/:id',
            element: (
              <RequirePersona role="user">
                <AuthorThreadScreen />
              </RequirePersona>
            ),
          },
```

- [ ] **Step 7: Run the tests, look at it, commit**

Run: `npx vitest run src/features` — Expected: PASS.

Compare `/zglos-pomysl` (form and success), `/moje-sprawy` and
`/moje-sprawy/HUB-2026-0142` with their mockups. To see the send error, set
the browser offline in DevTools and send a message.

```bash
npm run format && npm run check
git add -A frontend/src
git commit -m "feat: add idea form, my cases and the author thread"
```

---

### Task 12: ROPS panel — queue (A2), curator thread (C3), trends (A6)

**Files:**
- Create in `src/features/rops/`: `QueueScreen.tsx`, `QueueScreen.module.css`, `CuratorThreadScreen.tsx`, `CuratorThreadScreen.module.css`, `TrendsScreen.tsx`, `TrendsScreen.module.css`, `trends.ts`
- Modify: `src/app/routes.tsx`
- Test: `src/features/rops/trends.test.ts`, `src/features/rops/rops.test.tsx`
- Mockups: `A2-Kolejka.dc.html`, `C3-Watek.dc.html` (the `sc-if isRops` block), `A6-Trendy.dc.html`

**Interfaces:**
- Consumes: `useThread`, `Composer` (Task 11), `STATUS_VIEW`, `StatusPill`, `ChoiceChip`, `useAsync`.
- Produces: `QueueScreen`, `CuratorThreadScreen`, `TrendsScreen`; from `trends.ts`: `trendDelta(values: readonly number[]): { text: string; rising: boolean }`, `tileLevel(value: number): 1 | 2 | 3 | 4`, `topDistricts(districts: readonly DistrictTile[], count: number): readonly LabelledValue[]`.

**Contract — A2**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | Kolejka zgłoszeń | followed by `<open> otwartych · <fresh> nowych · <overdue> bez odpowiedzi ponad 48 h` |
| `input` | Szukaj w zgłoszeniach | stub on Enter |
| `role="group"` | Typ zgłoszenia | `ChoiceChip`s: Wszystkie typy, Potrzeba, Pomysł, Opinia, Do testów, Zapytanie do autora; single-select; the last maps to the type `Zapytanie` |
| buttons | Status ▾, Obszar ▾, Powiat ▾, ⚑ Sprawdź redakcję (3) | stubs |
| `<table>` | | columns: checkbox, Typ, Tytuł, Obszar, Gmina / powiat, Data ↓, Status, Ekspert |
| header checkbox | Zaznacz wszystkie | selects or clears all visible rows |
| row checkbox | `Zaznacz: <title>` | toggles that row; a selected row gets the `var(--c-primary-tint-2)` background |
| row title | `<title>` link | to `/rops/kolejka/<id>`; under it, when `flagged`: "⚑ Sprawdź redakcję — usunięto informacje o zdrowiu" |
| selection bar | text `Zaznaczono <n>` | rendered only when `n > 0`; buttons "Przypisz eksperta ▾" and "Zmień status ▾" are stubs; button "Odznacz" clears the selection |
| footer | `Wyniki 1–<rows> z <total> · dane przykładowe` | page buttons 1, 2, 3: stubs, 1 has `aria-current="page"` |

Type icons: Potrzeba ◆, Pomysł ✦, Opinia ★, Do testów ◎, Zapytanie ?. An
unassigned expert shows "Nieprzypisany" in `var(--c-muted)`. Loading renders
the mockup's six skeleton rows inside the table body with a `role="status"`
line "Wczytujemy zgłoszenia…" above the table. Changing the type filter clears
the selection.

**Contract — C3 curator view**

| Element | Accessible name | Behaviour |
|---|---|---|
| link | ← Kolejka zgłoszeń | to `/rops/kolejka` |
| header | type pill (`<icon> <type>`), `h1` with the title, the case id in mono | |
| each message | `<article>` | name is `Ty (<persona name>)` when `message.from === persona.id`, otherwise `message.authorName` |
| `Composer` | label "Odpowiedź do autorki", send "Wyślij i powiadom autorkę", toolbar: a stub button "Szablony ▾" | sends as the current persona |
| "Akcje" card | buttons Przypisz eksperta, Scal z podobnym (2), Oznacz jako lukę, Zamknij zgłoszenie | stubs |
| "Szczegóły" card | Obszar, Powiat, Etap, Ekspert | from `area`, `place`, `stage ?? '—'`, `expert ?? 'Nieprzypisany'` |

**Contract — A6**

| Element | Accessible name | Behaviour |
|---|---|---|
| `h1` | Trendy potrzeb | |
| buttons | Ostatnie 6 miesięcy ▾, Wszystkie obszary ▾, Pokaż jako tabelę, Pokaż wszystkie 22 powiaty | stubs |
| trend row per area | area name, six bars, the last value, the change | bar height `${String((value / 40) * 100)}%`; the last bar uses `var(--c-primary)`, the others `var(--c-blue-bar)`; the change text and colour come from `trendDelta` (rising is `var(--c-danger)`, falling `var(--c-success)`) |
| tile per district | `title="<name>: <value>"` | placed with inline `gridRow` / `gridColumn`; class `level<tileLevel(value)>`; level 1 has the `var(--c-blue-edge)` border |
| legend | 0–9, 10–19, 20–29, 30+ | |
| table of the top four | from `topDistricts(districts, 4)` | |
| gap row per gap | "◇ Luka", title, `<count> zgłoszeń · <districts> powiatów · ostatnie <last>` | button "Przekształć w wyzwanie do naboru": stub |

- [ ] **Step 1: Write the failing helper tests**

`src/features/rops/trends.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { exampleTrends } from '../../api/mock/data/trends';
import { tileLevel, topDistricts, trendDelta } from './trends';

describe('trends helpers', (): void => {
  it('describes a rising trend', (): void => {
    expect(trendDelta([18, 21, 22, 26, 29, 34])).toEqual({
      text: '↑ +89%',
      rising: true,
    });
  });

  it('describes a falling trend', (): void => {
    expect(trendDelta([16, 14, 15, 12, 13, 11])).toEqual({
      text: '↓ -31%',
      rising: false,
    });
  });

  it.each([
    [0, 1],
    [9, 1],
    [10, 2],
    [19, 2],
    [20, 3],
    [29, 3],
    [30, 4],
    [38, 4],
  ])('puts %i in level %i', (value: number, level: number): void => {
    expect(tileLevel(value)).toBe(level);
  });

  it('lists the busiest districts, prefixing counties', (): void => {
    expect(topDistricts(exampleTrends.districts, 4)).toEqual([
      { label: 'Kraków', value: '38' },
      { label: 'pow. tarnowski', value: '27' },
      { label: 'pow. krakowski', value: '24' },
      { label: 'pow. nowosądecki', value: '22' },
    ]);
  });
});
```

This test file imports from `api/mock/` only to reuse the fixture; production
code in `features/` still must not.

Run: `npx vitest run src/features/rops/trends.test.ts` — Expected: FAIL.

- [ ] **Step 2: Implement the helpers**

`src/features/rops/trends.ts`:

```ts
import type { DistrictTile, LabelledValue } from '../../api/types';

export interface TrendDelta {
  readonly text: string;
  readonly rising: boolean;
}

/** Percentage change from the first to the last month. */
export function trendDelta(values: readonly number[]): TrendDelta {
  const first: number = values[0] ?? 0;
  const last: number = values.at(-1) ?? 0;
  const change: number =
    first === 0 ? 0 : Math.round(((last - first) / first) * 100);
  const rising: boolean = change >= 0;
  return { text: `${rising ? '↑ +' : '↓ '}${String(change)}%`, rising };
}

export function tileLevel(value: number): 1 | 2 | 3 | 4 {
  if (value >= 30) {
    return 4;
  }
  if (value >= 20) {
    return 3;
  }
  return value >= 10 ? 2 : 1;
}

/** Cities are capitalised in the data; counties get the "pow." prefix. */
export function topDistricts(
  districts: readonly DistrictTile[],
  count: number,
): readonly LabelledValue[] {
  return [...districts]
    .sort((a: DistrictTile, b: DistrictTile): number => b.value - a.value)
    .slice(0, count)
    .map(
      (district: DistrictTile): LabelledValue => ({
        label: /^\p{Lu}/u.test(district.name)
          ? district.name
          : `pow. ${district.name}`,
        value: String(district.value),
      }),
    );
}
```

Run the test — Expected: PASS (11 tests).

- [ ] **Step 3: Write the failing integration tests**

`src/features/rops/rops.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { renderApp } from '../../test/renderApp';

describe('A2 queue', (): void => {
  it('lists the example rows with the totals', async (): Promise<void> => {
    renderApp('/rops/kolejka', { persona: 'anna' });
    expect(
      await screen.findByText(
        '38 otwartych · 12 nowych · 4 bez odpowiedzi ponad 48 h',
      ),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(10);
    expect(screen.getByText('Wyniki 1–9 z 38 · dane przykładowe')).toBeInTheDocument();
    expect(
      screen.getAllByText('⚑ Sprawdź redakcję — usunięto informacje o zdrowiu'),
    ).toHaveLength(3);
  });

  it('filters by type', async (): Promise<void> => {
    const { user } = renderApp('/rops/kolejka', { persona: 'anna' });
    await screen.findByRole('link', { name: 'Wiejska biblioteka rzeczy' });
    await user.click(
      within(screen.getByRole('group', { name: 'Typ zgłoszenia' })).getByRole(
        'button',
        { name: 'Zapytanie do autora' },
      ),
    );
    expect(
      await screen.findByText('Wyniki 1–1 z 38 · dane przykładowe'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Koszty startu: Mobilna Kawiarenka Seniora',
      }),
    ).toBeInTheDocument();
  });

  it('selects rows and clears the selection', async (): Promise<void> => {
    const { user } = renderApp('/rops/kolejka', { persona: 'anna' });
    await user.click(
      await screen.findByRole('checkbox', {
        name: 'Zaznacz: Sąsiedzka kawiarenka',
      }),
    );
    await user.click(
      screen.getByRole('checkbox', { name: 'Zaznacz: Wiejska biblioteka rzeczy' }),
    );
    expect(screen.getByText('Zaznaczono 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Odznacz' }));
    expect(screen.queryByText(/^Zaznaczono/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: 'Zaznacz wszystkie' }));
    expect(screen.getByText('Zaznaczono 9')).toBeInTheDocument();
  });
});

describe('A6 trends', (): void => {
  it('shows trends, districts and gaps', async (): Promise<void> => {
    renderApp('/rops/trendy', { persona: 'anna' });
    expect(
      screen.getByRole('heading', { level: 1, name: 'Trendy potrzeb' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('↑ +89%')).toBeInTheDocument();
    expect(screen.getByText('↓ -31%')).toBeInTheDocument();
    expect(screen.getByTitle('Kraków: 38')).toBeInTheDocument();
    expect(screen.getByText('pow. tarnowski')).toBeInTheDocument();
    expect(
      screen.getByText('9 zgłoszeń · 5 powiatów · ostatnie 02.10'),
    ).toBeInTheDocument();
  });
});

describe('idea to notification', (): void => {
  it('carries an idea to the curator and the reply back to the author', async (): Promise<void> => {
    const { user } = renderApp('/zglos-pomysl', { persona: 'maria' });

    // Step 4 of the demo: the author sends an idea.
    const name: HTMLElement = screen.getByRole('textbox', {
      name: '1. Nazwa robocza',
    });
    await user.clear(name);
    await user.type(name, 'Klub filmowy');
    await user.click(screen.getByRole('button', { name: 'Wyślij fiszkę' }));
    expect(await screen.findByText('HUB-2026-0143')).toBeInTheDocument();

    // Step 5: the curator finds it first in the queue and replies.
    await user.click(screen.getByRole('button', { name: 'Konto: Maria N.' }));
    await user.click(screen.getByRole('menuitem', { name: 'Zmień osobę' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wybierz osobę' })).getByRole(
        'button',
        { name: /Anna Kowalczyk/ },
      ),
    );
    await user.click(
      screen.getByRole('button', { name: 'Konto: Anna Kowalczyk' }),
    );
    await user.click(screen.getByRole('menuitem', { name: 'Panel ROPS' }));
    const link: HTMLElement = await screen.findByRole('link', {
      name: 'Klub filmowy',
    });
    expect(screen.getAllByRole('row')[1]).toContainElement(link);
    expect(
      screen.getByText('39 otwartych · 13 nowych · 4 bez odpowiedzi ponad 48 h'),
    ).toBeInTheDocument();
    await user.click(link);
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Klub filmowy' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('article')).toHaveLength(1);
    await user.type(
      screen.getByRole('textbox', { name: 'Odpowiedź do autorki' }),
      'Dziękujemy, odezwiemy się w tym tygodniu.',
    );
    await user.click(
      screen.getByRole('button', { name: 'Wyślij i powiadom autorkę' }),
    );
    expect(await screen.findAllByRole('article')).toHaveLength(2);
    expect(screen.getAllByRole('article')[1]).toHaveTextContent(
      'Ty (Anna Kowalczyk)',
    );

    // The author signs back in and is told about the reply.
    await user.click(screen.getByRole('button', { name: 'Zmień osobę' }));
    await user.click(
      within(screen.getByRole('dialog', { name: 'Wybierz osobę' })).getByRole(
        'button',
        { name: /Maria N\./ },
      ),
    );
    // The panel now asks for a curator; leaving it returns to the start page.
    await user.click(screen.getByRole('button', { name: 'Anuluj' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      'ROPS odpowiedział na Twój pomysł »Klub filmowy«',
    );
    expect(
      await screen.findByRole('button', {
        name: 'Powiadomienia, 4 nieprzeczytane',
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Otwórz wątek' }));
    expect(
      await screen.findByText('Dziękujemy, odezwiemy się w tym tygodniu.'),
    ).toBeInTheDocument();
    expect(screen.getAllByText(/Odpowiedziano/).length).toBeGreaterThan(0);
  });
});
```

Run: `npx vitest run src/features/rops/rops.test.tsx` — Expected: FAIL.

- [ ] **Step 4: Implement A2**

`src/features/rops/QueueScreen.tsx` — logic in full, JSX from
`A2-Kolejka.dc.html` and the A2 contract. Build the list as a real `<table>`;
keep the mockup's column widths with
`table-layout: fixed` and `<col>` widths `2rem, 7.5rem, auto, 7.5rem, 8.75rem, 3.75rem, 9.375rem, 7.5rem`.

```tsx
const TYPE_FILTERS: readonly {
  readonly label: string;
  readonly type: CaseType | null;
}[] = [
  { label: 'Wszystkie typy', type: null },
  { label: 'Potrzeba', type: 'Potrzeba' },
  { label: 'Pomysł', type: 'Pomysł' },
  { label: 'Opinia', type: 'Opinia' },
  { label: 'Do testów', type: 'Do testów' },
  { label: 'Zapytanie do autora', type: 'Zapytanie' },
];

const TYPE_ICONS: Readonly<Record<CaseType, string>> = {
  Potrzeba: '◆',
  Pomysł: '✦',
  Opinia: '★',
  'Do testów': '◎',
  Zapytanie: '?',
};

export function QueueScreen(): ReactElement {
  const api: HubApi = useApi();
  const { stub } = useToast();
  const [type, setType] = useState<CaseType | null>(null);
  const [selected, setSelected] = useState<readonly string[]>([]);
  const { state, retry }: AsyncResult<QueuePage> = useAsync<QueuePage>(
    `queue:${type ?? 'all'}`,
    (signal: AbortSignal): Promise<QueuePage> =>
      api.listQueue({ type }, signal),
  );
  const rows: readonly QueueRow[] = state.status === 'ready' ? state.data.rows : [];
  const allSelected: boolean = rows.length > 0 && selected.length === rows.length;

  function filter(next: CaseType | null): void {
    setType(next);
    setSelected([]);
  }

  function toggle(id: string): void {
    setSelected((current: readonly string[]): readonly string[] =>
      current.includes(id)
        ? current.filter((item: string): boolean => item !== id)
        : [...current, id],
    );
  }

  function toggleAll(): void {
    setSelected(allSelected ? [] : rows.map((row: QueueRow): string => row.id));
  }
  // The totals line and the footer render only when state.status === 'ready'.
  // Checkboxes are real <input type="checkbox"> with aria-label; style them to
  // the mockup's 22px boxes with `accent-color: var(--c-primary)`.
  // The search field:
  //   onKeyDown={(event: KeyboardEvent<HTMLInputElement>): void => {
  //     if (event.key === 'Enter') { stub(); }
  //   }}
}
```

The header row plus nine data rows give the ten `row` elements the test counts.

- [ ] **Step 5: Implement the curator thread**

`src/features/rops/CuratorThreadScreen.tsx` — logic in full, JSX from the
`sc-if isRops` block of `C3-Watek.dc.html` (without the sidebar, which the
layout renders) and the curator contract:

```tsx
export function CuratorThreadScreen(): ReactElement {
  const { id = '' } = useParams();
  const { persona } = useSession();
  const { stub } = useToast();
  const { state, retry, send } = useThread(id);
  // loading → role="status" with skeletons; error → <LoadError /> and the back link
  // ready → two columns:
  //   left:  back link, header, one <article> per message, then
  //     <Composer
  //       label="Odpowiedź do autorki"
  //       sendLabel="Wyślij i powiadom autorkę"
  //       toolbar={<Button variant="neutral" onClick={stub}>Szablony ▾</Button>}
  //       onSend={(text: string): Promise<void> =>
  //         persona === null ? Promise.resolve() : send(persona.id, text)}
  //     />
  //   right: the "Akcje" and "Szczegóły" cards.
  // A message's name: message.from === persona?.id
  //   ? `Ty (${persona.name})` : message.authorName
}
```

`TYPE_ICONS` is needed here too: move it from `QueueScreen.tsx` into
`src/features/rops/caseTypes.ts` and import it in both screens.

- [ ] **Step 6: Implement A6**

`src/features/rops/TrendsScreen.tsx` — logic in full, JSX from
`A6-Trendy.dc.html` and the A6 contract:

```tsx
const BAR_MAX: number = 40;

export function TrendsScreen(): ReactElement {
  const api: HubApi = useApi();
  const { stub } = useToast();
  const { state, retry }: AsyncResult<Trends> = useAsync<Trends>(
    'trends',
    (signal: AbortSignal): Promise<Trends> => api.getTrends(signal),
  );
  // The h1 and the two filter buttons render in every state.
  // loading → the mockup's `sc-if isLoading` block (21 tile skeletons)
  // error   → <LoadError message={state.message} onRetry={retry} />
  // ready   → the three sections. Per area:
  //   const delta: TrendDelta = trendDelta(area.values);
  //   bars: area.values.map((value, index) => <div title={String(value)}
  //     className={index === area.values.length - 1 ? styles['barLast'] : styles['bar']}
  //     style={{ height: `${String((value / BAR_MAX) * 100)}%` }} />)
  //   last value: area.values.at(-1)
  //   change: <span className={delta.rising ? styles['rising'] : styles['falling']}>{delta.text}</span>
  // Per tile: style={{ gridRow: tile.row, gridColumn: tile.col }},
  //   className={styles[`level${String(tileLevel(tile.value))}`]},
  //   title={`${tile.name}: ${String(tile.value)}`}
  // The gap line is one string:
  //   `${String(gap.count)} zgłoszeń · ${String(gap.districts)} powiatów · ostatnie ${gap.last}`
}
```

- [ ] **Step 7: Register the routes**

In `src/app/routes.tsx` add to the `rops` children, before `*`:

```tsx
          { path: 'kolejka', element: <QueueScreen /> },
          { path: 'kolejka/:id', element: <CuratorThreadScreen /> },
          { path: 'trendy', element: <TrendsScreen /> },
```

The shell test "asks for a curator before showing the ROPS panel" still passes:
`/rops/kolejka` now renders the queue inside the same layout.

- [ ] **Step 8: Run the tests, look at it, commit**

Run: `npx vitest run` — Expected: PASS, all files.

Compare `/rops/kolejka`, a thread under it, and `/rops/trendy` with their
mockups at 1440px and 1024px.

```bash
npm run format && npm run check
git add -A frontend/src
git commit -m "feat: add ROPS queue, curator thread and need trends"
```

---

### Task 13: Documentation and the full walk-through

**Files:**
- Modify: `README.md` (repo root)

- [ ] **Step 1: Update the README**

In `README.md`, replace the opening paragraph (the two lines under `# Hubmi`)
with:

```markdown
Klikalna wersja demonstracyjna HubMe — Hubu Innowacji Społecznych: React +
TypeScript + Vite oraz API w FastAPI. Frontend działa na danych przykładowych
z makiet; backend udostępnia na razie tylko kontrolę stanu.
```

Replace the last paragraph (starting "Obecna aplikacja jest bazą") with:

```markdown
## Wersja demonstracyjna

Wszystkie dane są przykładowe i pochodzą z makiet w
`docs/design/hubme-makiety`. Frontend nie wysyła żadnych zapytań do backendu:
dane dostarcza `frontend/src/api/mock`, a ekrany korzystają wyłącznie z
interfejsu `HubApi` (`frontend/src/api/HubApi.ts`). Stan zgłoszeń i wątków
trzymany jest w pamięci i znika po odświeżeniu strony.

Logowanie jest zastąpione wyborem jednej z trzech przykładowych osób
(przycisk „Zaloguj się”):

- **Ewa W.** — pracownica GOPS, szuka rozwiązania i dostosowuje je do gminy,
- **Maria N.** — autorka pomysłu, wysyła fiszkę i rozmawia z ROPS,
- **Anna Kowalczyk** — kuratorka ROPS, ma dostęp do panelu pod `/rops`.

Scenariusz w sześciu krokach: opis problemu (`/`) → wyniki i karta innowacji →
„Dostosuj do mojej gminy” → fiszka pomysłu (`/zglos-pomysl`) → kolejka i wątek
w panelu ROPS (`/rops/kolejka`) → trendy potrzeb (`/rops/trendy`).

Funkcje bez makiety (m.in. „Prosty język”, dyktowanie, załączniki, PDF)
pokazują komunikat, że nie są dostępne w wersji demonstracyjnej. Układ jest
przygotowany dla ekranów o szerokości od 1024 px.
```

In the "Struktura" list, replace the `frontend/src` line with:

```markdown
- `frontend/src` — interfejs: `app` (routing, konteksty), `shell` (nagłówek,
  panel boczny), `ui` (wspólne komponenty), `features` (ekrany), `api`
  (typy, interfejs `HubApi`, dane przykładowe).
- `docs/design/hubme-makiety` — źródła makiet, wzorzec wyglądu ekranów.
```

Also update the sentence "Strona startowa wykonuje prawdziwe żądanie do
backendu i pokazuje stan połączenia." if it still appears: delete it.

- [ ] **Step 2: Run the whole quality gate**

From the repo root:

```bash
make check
```

Expected: backend and frontend checks pass. If `uv` is not installed, run
`npm run check --prefix frontend` and report that the backend half was not
run; the backend is untouched by this plan.

- [ ] **Step 3: Walk the six-step scenario by hand**

Run `npm run dev --prefix frontend`, open <http://localhost:5173> in a
1440px-wide window and follow the canvas file `HubMe Makiety.dc.html` step by
step:

1. M1 → M2 (restore one replacement) → M3 (remove a chip, answer a question).
2. M4 (reasons appear one by one) → open the first innovation.
3. "Dostosuj do mojej gminy" → sign in as Ewa W. → MW1 → MW2.
4. Switch to Maria N. → `/zglos-pomysl` → send → note the case number.
5. Switch to Anna Kowalczyk → Panel ROPS → open the new case → reply. Switch
   back to Maria N., leave the panel prompt with "Anuluj": the toast appears
   and the bell count rises; open the thread from the toast.
6. As Anna Kowalczyk open "Trendy potrzeb".

Then repeat at a 1024px-wide window and with "A+" at 130%, checking that no
screen overflows horizontally and no text is clipped. Fix any layout defect in
the screen's CSS module and re-run `npm run check`.

- [ ] **Step 4: Commit**

```bash
git add -A README.md frontend
git commit -m "docs: describe the HubMe demo and its personas"
```







