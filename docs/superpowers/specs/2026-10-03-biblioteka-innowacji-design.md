# Biblioteka innowacji (innovation library) — design

Date: 2026-10-03
Status: approved design, awaiting spec review

## Goal

Replace the `/biblioteka` stub with a browsable catalogue of innovations. A
visitor can search by text, filter by area and by features, sort the list, and
open any innovation's full card.

This sub-project is frontend only and runs on mock data, like the rest of the
demo. It adds one method to `HubApi`; a later backend sub-project replaces the
mock behind it.

## Decisions

| Topic | Decision |
|---|---|
| Scope | Frontend only, mock data behind `HubApi` |
| Design source | No mockup exists; the screen is composed from existing tokens and components. Layout "B" was chosen from three wireframes: filters on top, tile grid below |
| Filtering | In the browser. The API returns every summary; pure functions filter, sort and count |
| Filter state | In the URL query string |
| Example data | 12 innovations, each with a complete innovation card |
| Access | Public, no persona required |
| Language | Polish UI copy; code and identifiers in English |

## Screen

Route `/biblioteka`, a child of `PublicLayout`. The top-bar item "Biblioteka
innowacji" already points there and already stays active on `/innowacje/*`.

Layout, top to bottom:

1. Title "Biblioteka innowacji" and a one-sentence introduction.
2. Search field with a visible label.
3. Chip row "Obszar": one chip per area, each with a count.
4. Chip row with the groups "Typ" and "Koszt" and the two toggles "Szuka
   testerów" and "Ma film".
5. Result bar: "5 innowacji z 12", a "Wyczyść filtry" link shown only when a
   filter or search text is set and at least one tile is listed (the empty
   state carries its own button), and the sort control on the right. Clearing
   resets search and filters and keeps the chosen sort.
6. Tile grid: three columns at the 1440px layout, two columns in narrower
   containers. Breakpoints use container queries, as the rest of the app does.

### Tile

Category line in small capitals (`area · kind`), name, one-sentence summary,
and tags: verification date, cost, "Szuka testerów" (when true), "Film" (when
true), and rating with review count. The name is a heading and a link to
`/innowacje/:id`; the link is stretched over the tile so the whole tile is
clickable without nesting interactive elements.

### Filtering rules

- **Search** matches against name and summary. It ignores case and Polish
  diacritics ("zyczliwosci" finds "Życzliwości"). The text is split on
  whitespace and every word must occur.
- **Within a chip group** selections combine with OR; **between groups** and
  with search and toggles they combine with AND. An empty group does not
  filter.
- **Area counts** show how many items would remain for that area given every
  other active filter (search, kind, cost, toggles), ignoring the area
  selection itself.
- **Cost bands** are yearly: `low` up to 10 000 zł, `mid` 10 000–50 000 zł,
  `high` above 50 000 zł. Each record carries its band explicitly; the display
  text is never parsed. A record whose cost is a range is assigned by the upper
  end of the range, and a per-edition cost counts as a yearly cost.

### Sorting

| Value | Label | Order |
|---|---|---|
| `verified` (default) | Ostatnio zweryfikowane | `verified` descending, compared as year then month |
| `rating` | Najlepiej oceniane | rating descending (decimal comma parsed), then review count descending |
| `name` | Alfabetycznie | name ascending with Polish collation |

Ties in every order fall back to name ascending. The control is a native
`<select>` with a label.

### URL state

`/biblioteka?q=&obszar=&typ=&koszt=&testerzy=1&film=1&sort=`

- `obszar`, `typ` and `koszt` are comma-separated lists of slugs.
- Default values are omitted, so the unfiltered library is plain `/biblioteka`.
- Unknown parameters and unknown values are ignored without an error.
- Every change replaces the current history entry. "Back" from an innovation
  card returns to the same filtered list instead of stepping through filters.

### States

- **Loading:** skeleton tiles; filters are rendered but counts are hidden.
- **Error:** `LoadError` with retry. The query string is untouched, so a retry
  restores the same view.
- **Empty:** "Żadna innowacja nie pasuje do tych filtrów", a "Wyczyść filtry"
  button, and a link to "Zgłoś pomysł".

### Areas

Five areas: Seniorzy, Niepełnosprawność, Rodzina i opiekunowie, Zdrowie
psychiczne, Społeczność lokalna.

Kinds: usługa, metoda, narzędzie.

## Data and API

### Types (`api/types.ts`)

```ts
export type InnovationArea =
  | 'Seniorzy'
  | 'Niepełnosprawność'
  | 'Rodzina i opiekunowie'
  | 'Zdrowie psychiczne'
  | 'Społeczność lokalna';
export type InnovationKind = 'usługa' | 'metoda' | 'narzędzie';
export type CostBand = 'low' | 'mid' | 'high';

export interface InnovationSummary {
  readonly id: string;
  readonly name: string;
  readonly area: InnovationArea;
  readonly kind: InnovationKind;
  readonly summary: string;
  readonly verified: string; // MM.YYYY
  readonly cost: string;
  readonly costBand: CostBand;
  readonly rating: string;
  readonly reviewCount: number;
  readonly seeksTesters: boolean;
  readonly hasVideo: boolean;
}
```

`Innovation` gains `area`, `kind`, `summary` and `costBand`. Its existing
`category` string stays, so the innovation card and the results screen are not
changed.

### API (`api/HubApi.ts`)

```ts
listInnovations(signal?: AbortSignal): Promise<readonly InnovationSummary[]>;
```

The mock derives each summary from the same record that `getInnovation`
serves, so a tile and its card cannot disagree.

### Mock data

`api/mock/data/innovations.ts` becomes the folder `api/mock/data/innovations/`
with one file per area and an `index.ts` that assembles the record map. It
holds 12 innovations: the three existing ones plus nine new ones with full
cards (facts, materials, steps, funding, reviews), written in the style of the
mockups. Every area, kind and cost band has at least two items; at least three
items seek testers and at least three have a video. All content is fictional
example data.

The service draft for a new innovation returns the same example draft as
today; the mock already ignores its input.

## Code structure

New folder `frontend/src/features/library/`:

| File | Responsibility |
|---|---|
| `libraryQuery.ts` | `LibraryQuery` type, `parseQuery(URLSearchParams)`, `toSearchParams(query)`, slug tables |
| `filterInnovations.ts` | Pure `filterInnovations`, `sortInnovations`, `countByArea` |
| `useLibraryQuery.ts` | Hook over `useSearchParams`; returns `query` and `setQuery` (replace) |
| `LibraryFilters.tsx` | Search field and chip rows; takes `query`, counts and `onChange`; no API access |
| `InnovationTile.tsx` | One tile |
| `LibraryScreen.tsx`, `.module.css` | Loads the list with `useAsync`, composes the parts, renders states |

Reused: `ChoiceChip`, `Skeleton`, `LoadError`, `Card`, design tokens.

`app/routes.tsx` gains the `biblioteka` route. `shell/navigation.ts` needs no
change.

## Accessibility

- Each chip group is a `role="group"` with an accessible name; chips are
  buttons with `aria-pressed`.
- The result count sits in an `aria-live="polite"` region.
- Tiles form a `<ul>`; each name is a heading.
- "Wyczyść filtry" moves focus to the search field.
- Targets keep the `--target` minimum size; focus rings match the rest of the
  app.

## Testing

- `filterInnovations.test.ts`: diacritic- and case-insensitive search,
  multi-word search, OR within a group and AND between groups, each cost band,
  both toggles, all three sort orders (including `MM.YYYY` across a year
  boundary and tie-breaks), area counts.
- `libraryQuery.test.ts`: parse and serialise round trip, omitted defaults,
  unknown values ignored.
- `library.test.tsx`: 12 tiles load; typing and clicking a chip narrow the
  list and update the count; empty state and "Wyczyść filtry"; entering with
  `?obszar=…` shows the filtered list; a tile links to its card; an API error
  shows retry.
- `createMockApi.test.ts`: `listInnovations` returns 12 items and every listed
  `id` resolves through `getInnovation`.
- `shell.test.tsx`: the top-bar item opens the library, not the stub.

## Done when

`make check` passes, and the user confirms the layout in a browser at 1440px
and 1024px (no browser automation is available on the development machine).

## Out of scope

Pagination, favourites, the ROPS "Innowacje" panel, changes to the results
screen or the innovation card layout, any backend work.
