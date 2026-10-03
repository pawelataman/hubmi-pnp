# HubMe clickable frontend demo — design

Date: 2026-10-03
Status: approved design, awaiting spec review

## Goal

Build the 12 screens of the "HubMe Makiety" design as a clickable React
application that runs on the mockups' example data. A presenter can walk the
six-step demo scenario end to end, and a visitor can explore freely.

This is sub-project 1. It contains no backend work. Each backend subsystem the
screens imply (personal-data redaction, AI summarisation and matching,
service-draft generation, submissions with threads and notifications, trend
analytics) gets its own later spec and replaces one part of the mock API.

## Source design

- Claude Design project `845e1554-3d2e-429d-a42d-ac4897f0e048`, canvas file
  `HubMe Makiety.dc.html`.
- Screen files: `M1-Start`, `M2-Podglad`, `M3-KartaProblemu`, `M4-Wyniki`,
  `Z2-KartaInnowacji`, `MW1-ProfilInstytucji`, `MW2-SzkicUslugi`, `K1-Fiszka`,
  `A2-Kolejka`, `C3-Watek`, `C1-Powiadomienia`, `A6-Trendy` (all `.dc.html`).
- Shared shells: `HubTopBar.dc.html`, `RopsSidebar.dc.html`.
- Not used: `support.js` (generated canvas runtime) and the
  `archiwum-v1-ciepla/` folder (archived earlier visual version).

The mockup files are the source of truth for layout, copy, example data and
colours. The implementation plan's first task snapshots the 14 files above into
`docs/design/hubme-makiety/` so later work does not depend on design-tool
access.

Template syntax in those files: `<sc-if value>` is a conditional, `<sc-for
list as>` is a loop, `<dc-import name>` embeds another file, and the
`renderVals()` method in each file's script block holds the example data.

## Decisions

| Topic | Decision |
|---|---|
| Scope | All 12 screens and their drawn secondary states, frontend only |
| Interaction | Forms, chips, toggles and validation work; the mock API returns the example results regardless of input |
| Identities | Mock login through a persona picker; no real authentication |
| Layout | Matches the mockups at 1440px, fluid down to 1024px, horizontal scroll below |
| Undesigned controls | Cheap ones work, the rest are stubs (see "Stubs") |
| Build approach | CSS Modules with design tokens, plus a typed `HubApi` interface with an in-process mock |
| Language | Polish UI copy, taken verbatim from the mockups |

## Tooling repair (prerequisite)

The committed frontend blueprint cannot be installed: `package.json` declares
no dependencies and there is no `package-lock.json`, although the Dockerfile
copies one.

- Declare the packages the existing config imports: `react`, `react-dom`,
  `vite`, `@vitejs/plugin-react`, `typescript`, `vitest`, `eslint`,
  `@eslint/js`, `globals`, `typescript-eslint`, `eslint-plugin-react-hooks`,
  `eslint-plugin-react-refresh`, `prettier`, `@types/react`,
  `@types/react-dom`, `@types/node`.
- Add: `react-router`, `@testing-library/react`,
  `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`.
- Commit `package-lock.json`. Versions are exact (`.npmrc` sets `save-exact`).
- Node 24 is required by `engines` and `.nvmrc`. The development machine has
  only Node 22 and 23, so the plan starts with `nvm install 24`.
- `index.html`: `lang="pl"`, title "HubMe", Red Hat Display (400, 500, 600,
  700) and Red Hat Mono (400, 500) from Google Fonts.
- Remove the blueprint placeholder: `App.tsx` content, `components/ApiStatus.tsx`,
  `hooks/useApiHealth.ts`, `styles.css`. Keep `api/health.ts` and its test.
- `vitest.config.ts`: environment `jsdom`, include `src/**/*.test.{ts,tsx}`,
  a setup file that registers `jest-dom` matchers.

## Source layout

All paths are under `frontend/src/`.

| Folder | Contents |
|---|---|
| `app/` | `router.tsx`, `PublicLayout`, `RopsLayout`, `SessionProvider`, `TextSizeProvider`, `ApiProvider`, `useAsync` |
| `ui/` | `tokens.css`, `base.css`, and the shared kit: `Button`, `Chip`, `Card`, `AiBadge`, `Skeleton`, `FieldError`, `Stepper`, `StatusPill`, `Switch`, `Toast`, `LoadError` |
| `shell/` | `HubTopBar`, `AiNotice`, `Footer`, `RopsSidebar`, `PersonaPicker`, `NotificationsPopover`, `DemoStub` |
| `api/` | `types.ts`, `HubApi.ts` (interface), `mock/createMockApi.ts`, `mock/store.ts`, `mock/data/*.ts`, plus the existing `health.ts` |
| `features/matchmaking/` | M1, M2, M3, M4 and `MatchmakingProvider` |
| `features/innovation/` | Z2 |
| `features/adaptation/` | MW1, MW2 and `AdaptationProvider` |
| `features/idea/` | K1 |
| `features/cases/` | "Moje sprawy" list and the C3 author view |
| `features/rops/` | A2, the C3 curator view, A6 |

Rules:

- Each screen is one component with its own CSS module.
- Screens read and write data only through `HubApi`, obtained from
  `ApiProvider`. No screen imports from `api/mock/`.
- `ui/` components know nothing about HubMe's domain. `shell/` and
  `features/` may use `ui/`; `ui/` uses neither.

## Routes

| Path | Screen | Access |
|---|---|---|
| `/` | M1 describe problem | anyone |
| `/znajdz/podglad` | M2 anonymisation preview | anyone |
| `/znajdz/doprecyzowanie` | M3 problem card and questions | anyone |
| `/znajdz/wyniki` | M4 results | anyone |
| `/innowacje/:id` | Z2 innovation card | anyone |
| `/innowacje/:id/dostosuj` | MW1 institution profile | logged in |
| `/innowacje/:id/szkic` | MW2 service draft | logged in |
| `/zglos-pomysl` | K1 idea form and success state | anyone |
| `/moje-sprawy` | case list | logged in |
| `/moje-sprawy/:id` | C3 thread, author view | logged in |
| `/rops/kolejka` | A2 queue | curator |
| `/rops/kolejka/:id` | C3 thread, curator view | curator |
| `/rops/trendy` | A6 trends | curator |
| `*` | `DemoStub` placeholder page | anyone |

- `PublicLayout` renders `HubTopBar` and wraps every route outside `/rops`.
  `RopsLayout` renders `RopsSidebar` and wraps `/rops/*`.
- The AI notice band under the top bar shows on M1–M4, Z2, MW1 and MW2 only,
  as in the mockups. The footer is drawn only on M1 and appears only there.
- The active top-bar item is "Znajdź rozwiązanie" on M1–M4, "Biblioteka
  innowacji" on Z2, MW1 and MW2, "Zgłoś pomysł" on K1, and none elsewhere.
- C1 is not a route. The notifications popover opens from the bell on any
  logged-in public page, and the toast can appear on any of them.
- Guard behaviour: opening a guarded route without a sufficient persona opens
  `PersonaPicker`; after a suitable choice the user lands on the requested
  page. Cancelling returns to `/`. A logged-in non-curator opening `/rops/*`
  gets the same picker.
- `/znajdz/*` routes redirect to `/` when the matchmaking state holds no
  description. `/innowacje/:id/szkic` redirects to `/innowacje/:id/dostosuj`
  when no profile has been submitted.
- An unknown innovation id or case id renders `LoadError` with a link back.

## Personas

| Persona | Initials | Role | Unread notifications at start |
|---|---|---|---|
| Ewa W., GOPS worker | EW | user | 1 |
| Maria N., idea author | MN | user | 3 |
| Anna Kowalczyk, ROPS curator | AK | curator | not shown (sidebar layout) |

"Zaloguj się" in the top bar opens `PersonaPicker`. The avatar opens a small
menu with "Zmień osobę" and "Wyloguj". The chosen persona persists in
`sessionStorage`. The curator, when on a public page, sees a "Panel ROPS"
link in that menu.

## Client state

| Provider | Holds | Scope | Persistence |
|---|---|---|---|
| `SessionProvider` | current persona or none | whole app | `sessionStorage` |
| `TextSizeProvider` | text-size step: 100, 115 or 130% | whole app | `sessionStorage` |
| `MatchmakingProvider` | description, municipality, "on behalf" switch, restored replacements, problem-card chips, question answers | `/` and `/znajdz/*` | memory |
| `AdaptationProvider` | institution profile form values | `/innowacje/:id/dostosuj` and `/szkic` | memory |

`TextSizeProvider` sets the root element's font size. All sizes in CSS are in
`rem` (mockup pixels divided by 16), so "A+" scales every screen. "A+" cycles
100 → 115 → 130 → 100.

`useAsync(load, deps)` returns `{ status: 'loading' }`, `{ status: 'ready',
data }` or `{ status: 'error', message }`, plus `retry()`. It aborts on
unmount. Every data-loading screen uses it.

## API

### Interface

```ts
interface HubApi {
  // matchmaking
  redactDescription(text: string): Promise<RedactionResult>;
  summariseProblem(input: ProblemInput): Promise<ProblemCard>;
  findMatches(card: ProblemCard): Promise<MatchResults>;
  getMatchReason(innovationId: string): Promise<ReasonSegment[]>;
  getLocalStats(municipality: string): Promise<LocalStat[]>;
  // innovation
  getInnovation(id: string): Promise<Innovation>;
  // adaptation
  getMunicipalityFacts(municipality: string): Promise<MunicipalityFacts>;
  draftService(innovationId: string, profile: InstitutionProfile): AsyncIterable<DraftSection>;
  // idea
  submitIdea(idea: IdeaForm, author: PersonaId | null): Promise<SubmittedCase>;
  // cases
  listMyCases(persona: PersonaId): Promise<CaseSummary[]>;
  getCase(id: string): Promise<CaseThread>;
  sendMessage(caseId: string, from: PersonaId, text: string): Promise<CaseThread>;
  // notifications
  listNotifications(persona: PersonaId): Promise<Notification[]>;
  markAllRead(persona: PersonaId): Promise<void>;
  subscribeToNotifications(persona: PersonaId, onNew: (n: Notification) => void): () => void;
  // rops
  listQueue(filter: QueueFilter): Promise<QueuePage>;
  getTrends(): Promise<Trends>;
}
```

All types are `readonly` and live in `api/types.ts`. Every method accepts an
optional `AbortSignal` as its last argument (omitted above for brevity).

### Mock implementation

`createMockApi({ delayMs })` returns a `HubApi`. The app uses a delay drawn
from 600–1200 ms per call; tests pass `0`.

- Example data in `api/mock/data/` is transcribed from the `renderVals()`
  blocks and static markup of the mockup files.
- `redactDescription`: when the text equals the pre-filled example, it returns
  the five drawn replacements (OSOBA_A, MIEJSCOWOŚĆ, TELEFON, ZDROWIE,
  OSOBA_B). For any other text it returns the text unchanged with zero
  replacements. No real detection is attempted.
- `summariseProblem`, `findMatches`, `getLocalStats`, `getInnovation`,
  `getMunicipalityFacts`, `getTrends`: return the example data regardless of
  input. `getInnovation` knows the three example innovations by id; only
  "Sąsiedzkie Telefony Życzliwości" has a full card, and the other two reuse
  its structure with their own name, category, cost and verification date.
- `findMatches` resolves with the three cards without reasons. M4 then calls
  `getMatchReason` for each card, and the mock staggers these so the reasons
  appear one by one, as in the drawn loading state.
- `draftService` yields the sections in order (Zakres usługi, Odbiorcy, Kadra,
  Harmonogram, Koszty, Ryzyka) with a delay before each. The draft title uses
  the municipality from the profile; section text is the example text.

### In-memory store

`api/mock/store.ts` holds cases, threads and notifications, seeded with the
nine example queue rows, the example thread for `HUB-2026-0142`, and the four
example notifications for Maria N. It resets on page reload.

- `submitIdea` creates a case with the next number (`HUB-2026-0143`, …),
  status "Nowe", type "Pomysł", a reply-by date seven days ahead, and the
  author's first message. With a logged-in author it appears in that
  persona's "Moje sprawy". It always appears at the top of the curator's
  queue.
- `sendMessage` appends to the thread. When the sender is the curator, the
  case status becomes "Odpowiedziano" and the store creates an unread
  notification for the case's author and notifies subscribers, which raises
  the toast if the author is the current persona.
- `listQueue` applies the type filter and returns the page plus the summary
  counts shown in the A2 heading.

## Screens

Each screen reproduces its mockup file. Only behaviour that the static mockup
does not show is listed here.

**M1 — describe problem.** The textarea opens pre-filled with the example
description. The three example buttons replace the textarea content. "Dalej"
validates and navigates to M2. Municipality is a free-text input pre-filled
with the example.

**M2 — preview.** Calls `redactDescription` on entry (loading skeleton).
"Cofnij" on a replacement restores the original fragment in the text and
changes that row's button to "Usuń ponownie". The health-information
replacement cannot be restored; its button is absent. With zero replacements
the green banner reads "Nie znaleźliśmy informacji, które mogą identyfikować
osobę." and the replacements panel is hidden. "Wróć do edycji" returns to M1
with the text kept.

**M3 — problem card.** Calls `summariseProblem` (loading skeleton). Chips can
be removed. "+ Dodaj" turns into an inline text input that adds a chip on
Enter. Question options are single-select; "Pomiń" clears the selection.
"Popraw streszczenie" makes the summary paragraph editable in place.

**M4 — results.** Loads as described under "Mock implementation". "Przydatne"
and "Nieprzydatne" are a mutually exclusive toggle per card. "Pokaż, jak
system dopasował" is a stub. "Zobacz szczegóły" opens Z2. "Zmień opis"
returns to M1. "Przekaż problem do Hubu" is a stub.

**Z2 — innovation card.** The three tabs switch the visible content: "Opis"
shows the drawn two-column layout; "Finansowanie i wsparcie" and "Opinie"
show their respective card full width. "Dostosuj do mojej gminy" goes to MW1
(through the guard). "← Wróć do wyników" returns to M4 when matchmaking state
exists and is hidden otherwise.

**MW1 — institution profile.** One form, as drawn, with the five-step
indicator reflecting which groups are filled. Budget is single-select;
resources are multi-select. "Przygotuj szkic usługi" validates and goes to
MW2.

**MW2 — service draft.** Consumes `draftService`; sections appear in order
with the drawn "Piszemy sekcję…" placeholder naming the section in progress
and listing those remaining. "Edytuj" makes that section's text editable in
place, with "Zapisz" and "Anuluj". The left section list scrolls to the
section. "Założenia" reflects the submitted profile. "Zmień dane gminy"
returns to MW1.

**K1 — idea form.** The preview card on the right updates live from the
form. "Wyślij fiszkę" validates, calls `submitIdea`, and shows the drawn
success state with the returned case number, idea title and reply-by date.
"Przejdź do Moich spraw" goes to `/moje-sprawy` (through the guard). "Zgłoś
kolejny pomysł" resets the form.

**Moje sprawy.** Not a numbered mockup; the layout is the list sketched
behind the C1 popover: heading plus one row per case with title and status,
each linking to its thread. Empty state: "Nie masz jeszcze żadnych spraw."
with a link to K1.

**C3 — thread.** Author view under `/moje-sprawy/:id`, curator view under
`/rops/kolejka/:id`. Own messages are labelled "Ty". Sending calls
`sendMessage` and appends the result. The status timeline in the author view
reflects the case status. The curator's side-panel actions and "Szablony" are
stubs.

**C1 — notifications.** Popover on the bell with the unread count badge.
"Oznacz jako przeczytane" calls `markAllRead`. A notification that refers to
a case links to its thread. The toast appears on a new notification, links to
the thread, and closes on "✕" or after 8 seconds. Empty state as drawn.

**A2 — queue.** Type chips filter the list (single-select, "Wszystkie typy"
default). Row checkboxes and the header checkbox select rows; the blue
selection bar appears when at least one row is selected and "Odznacz" clears
it. Row titles link to the thread. Search, the three dropdown filters, the
"Sprawdź redakcję" filter, bulk actions and pagination are stubs.

**A6 — trends.** Renders the bar rows, the district tile map with its legend
and alternative table, and the gaps list from `getTrends`. Both period and
area selectors, "Pokaż jako tabelę", "Pokaż wszystkie 22 powiaty" and
"Przekształć w wyzwanie do naboru" are stubs.

### Stubs

A stub is never a dead click.

- A stubbed button or toggle shows a toast: "Ta funkcja nie jest dostępna w
  wersji demonstracyjnej."
- A stubbed navigation target (top-bar items "Biblioteka innowacji",
  "Wyzwania Małopolski", "Nabory"; sidebar items "Pulpit", "Innowacje",
  "Nabory", "Eksperci i użytkownicy"; footer links; "Ustawienia powiadomień")
  leads to the `DemoStub` page, which names the section and links back.
- Stubbed controls beyond those listed per screen: "Prosty język", "Dyktuj",
  "Zgłaszam w czyimś imieniu" (toggles visually, has no effect), file
  attachment, video playback, material downloads, "Zapytaj autora", "Chcę
  testować", "Oceń", "Zapytaj eksperta", "Przenieś do wniosku", "Pobierz PDF
  dla kierownika", "Rozwiń pomysł z asystentem", "Wolisz porozmawiać z
  człowiekiem?", "Napisz do nas".

## Styling and fidelity

- `ui/tokens.css` defines custom properties for:
  - colours: `#2462AD` primary, `#0F4A91` primary dark, `#E8F0F9` and
    `#F3F7FC` primary tints, `#88C1E9` and `#B9E0F7` light blues, `#1E7A3C`
    success, `#E6F2EA` success tint, `#C8000E` danger, `#FFF4D6` redaction
    highlight, and the greys `#292929`, `#333333`, `#4D504D`, `#8A8A8A`,
    `#BDBDBD`, `#E6E6E6`, `#ECECEC`, `#EFEFEF`, `#F6F6F6`, `#FFFFFF`;
  - the font families, the type sizes used in the mockups, and the 4px
    radius.
- No CSS module hard-codes a colour.
- At a 1440px viewport each screen matches its mockup. Grids keep the
  mockups' flexible column ratios. The mockups' fixed centred widths (960,
  1000, 1120 and 820px) become `max-width` with side padding. Below 1024px
  the layout stops shrinking and the page scrolls horizontally.
- Form controls drawn as static boxes are built as real `input`, `textarea`
  and `button` elements with associated labels, a visible focus ring (the
  2px primary outline with offset drawn on M1), keyboard operation, and the
  44px minimum target height the design uses.
- ARIA roles and live regions present in the mockups (`role="alert"`,
  `role="status"`, `aria-current`, `role="switch"`, `role="dialog"`,
  `role="tablist"`) are kept.
- Icons are the text glyphs used in the mockups. No icon library.
- AI-generated content keeps the dashed border and "AI" badge treatment.
- Colours are reproduced as drawn, including the Z2 "Szuka testerów" chip
  with a blue border and red text.

## Validation and errors

| Where | Rule | Result |
|---|---|---|
| M1 | description shorter than 60 characters after trimming | drawn error state; text kept; focus moves to the textarea |
| MW1 | recipients is not a positive whole number | drawn field error with the drawn message |
| K1 | name, one-sentence summary, "for whom", "problem" and stage are required; summary at most 160 characters; e-mail must be well-formed if given | `FieldError` under each failing field; K1 has no drawn error state, so it reuses the M1 pattern |
| C3 | message is empty | send button disabled |
| C3 | send while `navigator.onLine` is false | drawn "Nie wysłano" state; draft kept; button reads "Spróbuj ponownie" |
| any screen | a load rejects | `LoadError`: an inline panel with the message "Nie udało się wczytać danych." and a "Spróbuj ponownie" button calling `retry()` |

The mock rejects `sendMessage` when the browser is offline, which makes the
drawn error state demonstrable from DevTools. No other mock call fails on its
own; tests inject failures through `ApiProvider`.

## Testing

Vitest with jsdom and Testing Library. The mock API runs with zero delay.

Unit tests:

- `store`: `submitIdea` creates a case, lists it for its author and puts it
  first in the queue; a curator `sendMessage` sets the status and creates one
  unread notification for the author; an author `sendMessage` creates none.
- `createMockApi`: `redactDescription` returns five replacements for the
  example text and none for other text; `draftService` yields the six
  sections in order.
- `useAsync`: loading, ready, error and retry transitions; no state update
  after unmount.

Integration tests, rendered through the real router:

- Matchmaking: M1 → M2 → M3 → M4 → Z2, asserting each screen's heading and
  that the three result cards and their reasons appear.
- M1 with a short description shows the error and stays on M1 with the text
  intact.
- M2: restoring a replacement puts the original fragment back.
- Adaptation: Z2 → persona picker → MW1 → MW2, asserting all sections render
  and the title contains the entered municipality; MW1 with a non-numeric
  recipient count shows the field error.
- Idea to notification: submit K1 as Maria N. and see the case number; switch
  to the curator, find the case first in the queue, reply; switch back to
  Maria N. and see the unread count increase and the reply in the thread.
- C3: a rejected send keeps the draft and shows the error state.
- Guards: `/rops/kolejka` with no persona opens the picker; `/znajdz/wyniki`
  with no description redirects to `/`.
- "A+" changes the root font size through its three steps.
- A stubbed control raises the demo toast.

There are no automated visual tests. Fidelity is verified by eye against the
mockups at 1440px and 1024px. `npm run check` (lint, format check, typecheck,
tests, build) must pass.

## Out of scope

- Any backend change, real authentication or authorisation, persistence
  beyond the browser session.
- Layouts below 1024px, including tablet and phone.
- Working versions of the stubbed controls, and pages for undesigned
  navigation items.
- The provider-side onboarding and role choice described in `IDEATION.md`,
  which these mockups do not contain.
- Internationalisation; the UI is Polish only.
