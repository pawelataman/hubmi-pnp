# Biblioteka innowacji Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/biblioteka` stub with a catalogue of 12 example innovations that can be searched, filtered, sorted and opened.

**Architecture:** `HubApi.listInnovations()` returns every `InnovationSummary`; the mock derives them from the same records that `getInnovation` serves. Pure functions in `features/library` filter, sort and count in the browser. Filter state lives in the URL query string and is read and written through one hook.

**Tech Stack:** React 19.3, TypeScript 5.9 (strict), React Router 8, Vitest 5 with jsdom and Testing Library, CSS Modules.

**Spec:** `docs/superpowers/specs/2026-10-03-biblioteka-innowacji-design.md`

## Global Constraints

- **Node 24 only.** `.npmrc` sets `engine-strict`. In a non-interactive shell prefix every `npm`/`npx` command with `source ~/.nvm/nvm.sh && nvm use 24 >/dev/null &&`.
- **All commands run from `frontend/`** unless a step says otherwise.
- **No new dependencies.**
- **Frontend only.** Do not touch `backend/`.
- **UI copy is Polish**, exactly as written in this plan. Code, identifiers and comments are English.
- **All example content is fictional.** Do not use names of real organisations or people.
- **Colours come only from tokens** in `src/ui/tokens.css`. No hex value in any other CSS file or in TSX.
- **Sizes are in `rem`.** Border widths stay in `px`.
- **Breakpoints are container queries** on the `page` container (`@container page (width <= 75rem)`), never media queries.
- **Screens never import from `src/api/mock/`.** They call `useApi()`. Test files may.
- **Do not change** `InnovationScreen`, `ResultsScreen`, or `Innovation.category`.
- **Lint is strict and has zero tolerance for warnings.** Never add `eslint-disable`. The rules that shape every file:
  - every function has an explicit return type; every parameter and every non-destructured variable declaration has a type annotation (`const count: number = 0;`)
  - type-only imports use `import type`
  - an arrow function that returns nothing uses a block body: `(): void => { setOpen(true); }`
  - numbers in template literals are wrapped: `${String(count)}`
  - no non-null assertions (`!`); narrow with an `if`
  - class names are read with bracket syntax: `styles['tile']`
- **Baseline:** before this plan, `npx vitest run` reports 16 files and 134 tests passing.
- **Commits:** one per task, message as given. If your session supplies attribution trailers, append them.

## File Structure

All paths are under `frontend/src/`.

| File | Change | Responsibility |
|---|---|---|
| `api/types.ts` | modify | `InnovationArea`, `InnovationKind`, `CostBand`, `InnovationSummary`; `Innovation` extends the summary |
| `api/mock/data/innovations.ts` | delete | replaced by the folder below |
| `api/mock/data/innovations/seniorzy.ts` | create | 3 records |
| `api/mock/data/innovations/niepelnosprawnosc.ts` | create | 3 records |
| `api/mock/data/innovations/rodzina.ts` | create | 2 records |
| `api/mock/data/innovations/zdrowie-psychiczne.ts` | create | 2 records |
| `api/mock/data/innovations/spolecznosc.ts` | create | 2 records |
| `api/mock/data/innovations/index.ts` | create | assembles `innovations` record map |
| `api/mock/data/innovations/innovations.test.ts` | create | shape and distribution of the example data |
| `api/HubApi.ts` | modify | `listInnovations` |
| `api/mock/createMockApi.ts`, `.test.ts` | modify | mock `listInnovations` |
| `features/library/plural.ts`, `.test.ts` | create | Polish plural forms |
| `features/library/libraryQuery.ts`, `.test.ts` | create | `LibraryQuery`, option tables, URL parse/serialise |
| `features/library/filterInnovations.ts`, `.test.ts` | create | filter, sort, area counts, result label |
| `features/library/useLibraryQuery.ts` | create | hook over `useSearchParams` |
| `features/library/LibraryFilters.tsx`, `.module.css` | create | search field and chip groups |
| `features/library/InnovationTile.tsx`, `.module.css` | create | one tile |
| `features/library/LibraryScreen.tsx`, `.module.css` | create | loads, composes, renders states |
| `features/library/library.test.tsx` | create | screen integration tests |
| `app/routes.tsx` | modify | `biblioteka` route |
| `shell/navigation.ts` | modify | remove `/biblioteka` from `STUB_TITLES` |
| `shell/shell.test.tsx` | modify | top-bar item opens the library |
| `../README.md` | modify | describe the library |

---

### Task 1: Types and the 12 example innovations

**Files:**
- Modify: `src/api/types.ts` (the `// ── Innovation ──` section)
- Delete: `src/api/mock/data/innovations.ts`
- Create: `src/api/mock/data/innovations/{seniorzy,niepelnosprawnosc,rodzina,zdrowie-psychiczne,spolecznosc,index}.ts`
- Test: `src/api/mock/data/innovations/innovations.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - types `InnovationArea`, `InnovationKind`, `CostBand`, `InnovationSummary` and the extended `Innovation` from `src/api/types.ts`
  - `innovations: Readonly<Record<string, Innovation>>` from `src/api/mock/data/innovations` (same import path as before: `./data/innovations` now resolves to the folder's `index.ts`)

- [ ] **Step 1: Write the failing test**

Create `src/api/mock/data/innovations/innovations.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import type {
  CostBand,
  Innovation,
  InnovationArea,
  InnovationKind,
  LabelledValue,
} from '../../../types';
import { innovations } from './index';

type Row = readonly [
  id: string,
  name: string,
  area: InnovationArea,
  kind: InnovationKind,
  verified: string,
  cost: string,
  costBand: CostBand,
  rating: string,
  reviewCount: number,
  seeksTesters: boolean,
  hasVideo: boolean,
];

const EXPECTED: readonly Row[] = [
  ['telefony-zyczliwosci', 'Sąsiedzkie Telefony Życzliwości', 'Seniorzy', 'usługa', '05.2026', 'ok. 8–15 tys. zł / rok', 'mid', '4,6', 12, true, true],
  ['mobilna-kawiarenka', 'Mobilna Kawiarenka Seniora', 'Seniorzy', 'usługa', '02.2026', 'ok. 40–60 tys. zł / rok', 'high', '4,3', 7, false, true],
  ['cyfrowy-wnuk', 'Cyfrowy Wnuk', 'Seniorzy', 'metoda', '11.2025', 'ok. 5 tys. zł / edycja', 'low', '4,4', 9, false, false],
  ['asystent-na-godziny', 'Asystent na Godziny', 'Niepełnosprawność', 'usługa', '04.2026', 'ok. 60–90 tys. zł / rok', 'high', '4,7', 15, false, true],
  ['mapa-barier', 'Mapa Barier', 'Niepełnosprawność', 'narzędzie', '01.2026', 'ok. 3 tys. zł / rok', 'low', '4,1', 6, true, false],
  ['praca-na-probe', 'Praca na Próbę', 'Niepełnosprawność', 'metoda', '09.2025', 'ok. 20–35 tys. zł / rok', 'mid', '4,5', 8, false, false],
  ['wytchnieniowa-sobota', 'Wytchnieniowa Sobota', 'Rodzina i opiekunowie', 'usługa', '06.2026', 'ok. 25–40 tys. zł / rok', 'mid', '4,8', 11, true, true],
  ['krag-opiekunow', 'Krąg Opiekunów', 'Rodzina i opiekunowie', 'metoda', '12.2025', 'ok. 6 tys. zł / rok', 'low', '4,2', 5, false, false],
  ['pierwsza-rozmowa', 'Pierwsza Rozmowa', 'Zdrowie psychiczne', 'usługa', '03.2026', 'ok. 70–110 tys. zł / rok', 'high', '4,5', 10, false, false],
  ['termometr-nastroju', 'Termometr Nastroju', 'Zdrowie psychiczne', 'narzędzie', '10.2025', 'ok. 2 tys. zł / rok', 'low', '3,9', 4, true, false],
  ['sasiedzka-wypozyczalnia', 'Sąsiedzka Wypożyczalnia Rzeczy', 'Społeczność lokalna', 'narzędzie', '08.2025', 'ok. 10–18 tys. zł / rok', 'mid', '4,0', 6, false, true],
  ['lawka-dialogu', 'Ławka Dialogu', 'Społeczność lokalna', 'metoda', '07.2025', 'ok. 4 tys. zł / rok', 'low', '4,3', 3, false, false],
];

const SUMMARIES: Readonly<Record<string, string>> = {
  'telefony-zyczliwosci':
    'Wolontariusze codziennie dzwonią do samotnych seniorów i reagują, gdy coś ich niepokoi.',
  'mobilna-kawiarenka':
    'Bus z kawą i animatorem objeżdża sołectwa, w których nie ma świetlicy ani klubu seniora.',
  'cyfrowy-wnuk':
    'Uczniowie w parach z seniorami uczą obsługi telefonu, e-recepty i bankowości.',
  'asystent-na-godziny':
    'Asystent osobisty zamawiany na pojedyncze godziny: do lekarza, urzędu albo na zakupy.',
  'mapa-barier':
    'Mieszkańcy zaznaczają na wspólnej mapie progi, schody i brak podjazdów, a gmina planuje naprawy.',
  'praca-na-probe':
    'Dwutygodniowe płatne próby pracy u lokalnych pracodawców ze wsparciem trenera.',
  'wytchnieniowa-sobota':
    'Raz w miesiącu opiekunowie zostawiają bliskich pod fachową opieką i mają dzień dla siebie.',
  'krag-opiekunow':
    'Grupa samopomocowa opiekunów rodzinnych prowadzona według gotowego scenariusza spotkań.',
  'pierwsza-rozmowa':
    'Bezpłatna rozmowa z psychologiem w ciągu 72 godzin, bez skierowania i bez kolejki.',
  'termometr-nastroju':
    'Anonimowa ankieta w szkole, która co miesiąc pokazuje wychowawcom nastroje w klasach.',
  'sasiedzka-wypozyczalnia':
    'Punkt w remizie lub bibliotece, gdzie mieszkańcy wypożyczają narzędzia, sprzęt i wózki.',
  'lawka-dialogu':
    'Cykl moderowanych rozmów sąsiadów na ławce przed sklepem o sprawach wsi.',
};

const FACT_LABELS: readonly string[] = [
  'Problem',
  'Grupa docelowa',
  'Kto może skorzystać',
  'Składowe',
  'Koszt i kadra',
  'Jak skorzystać',
];

const all: readonly Innovation[] = Object.values(innovations);

function count(test: (item: Innovation) => boolean): number {
  return all.filter(test).length;
}

describe('example innovations', (): void => {
  it('holds the twelve records with the agreed catalogue fields', (): void => {
    const rows: readonly Row[] = all.map(
      (item: Innovation): Row => [
        item.id,
        item.name,
        item.area,
        item.kind,
        item.verified,
        item.cost,
        item.costBand,
        item.rating,
        item.reviewCount,
        item.seeksTesters,
        item.hasVideo,
      ],
    );
    expect(rows).toEqual(EXPECTED);
  });

  it('keys every record by its id and derives the category line', (): void => {
    for (const [key, item] of Object.entries(innovations)) {
      expect(key).toBe(item.id);
      expect(item.category).toBe(`${item.area} · ${item.kind}`);
      expect(item.summary).toBe(SUMMARIES[item.id]);
    }
  });

  it('gives every record a complete card', (): void => {
    for (const item of all) {
      expect(
        item.facts.map((fact: LabelledValue): string => fact.label),
      ).toEqual(FACT_LABELS);
      expect(item.materials.length).toBeGreaterThanOrEqual(2);
      expect(item.steps.length).toBeGreaterThanOrEqual(3);
      expect(item.fundingProgrammes.length).toBeGreaterThanOrEqual(1);
      expect(item.fundingNote).not.toBe('');
      expect(item.reviews.length).toBeGreaterThanOrEqual(2);
      expect(item.reviewCount).toBeGreaterThanOrEqual(item.reviews.length);
      expect(item.author).not.toBe('');
      expect(item.incubator).not.toBe('');
      expect(item.testerNote !== '').toBe(item.seeksTesters);
    }
  });

  it('does not reuse card text between records', (): void => {
    const problems: readonly string[] = all.map(
      (item: Innovation): string => item.facts[0]?.value ?? '',
    );
    const firstSteps: readonly string[] = all.map(
      (item: Innovation): string => item.steps[0] ?? '',
    );
    const firstQuotes: readonly string[] = all.map(
      (item: Innovation): string => item.reviews[0]?.quote ?? '',
    );
    expect(new Set(problems).size).toBe(all.length);
    expect(new Set(firstSteps).size).toBe(all.length);
    expect(new Set(firstQuotes).size).toBe(all.length);
  });

  it('covers every filter value at least twice', (): void => {
    const areas: readonly InnovationArea[] = [
      'Seniorzy',
      'Niepełnosprawność',
      'Rodzina i opiekunowie',
      'Zdrowie psychiczne',
      'Społeczność lokalna',
    ];
    const kinds: readonly InnovationKind[] = ['usługa', 'metoda', 'narzędzie'];
    const bands: readonly CostBand[] = ['low', 'mid', 'high'];
    for (const area of areas) {
      expect(
        count((item: Innovation): boolean => item.area === area),
      ).toBeGreaterThanOrEqual(2);
    }
    for (const kind of kinds) {
      expect(
        count((item: Innovation): boolean => item.kind === kind),
      ).toBeGreaterThanOrEqual(2);
    }
    for (const band of bands) {
      expect(
        count((item: Innovation): boolean => item.costBand === band),
      ).toBeGreaterThanOrEqual(2);
    }
    expect(
      count((item: Innovation): boolean => item.seeksTesters),
    ).toBeGreaterThanOrEqual(3);
    expect(
      count((item: Innovation): boolean => item.hasVideo),
    ).toBeGreaterThanOrEqual(3);
  });
});
```

After writing, run `npx prettier --write src/api/mock/data/innovations/innovations.test.ts` — Prettier will wrap the long `EXPECTED` rows; that is expected.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/api/mock/data/innovations` — Expected: FAIL, `./index` cannot be resolved.

- [ ] **Step 3: Add the types**

In `src/api/types.ts`, replace the `Innovation` interface (keep `LabelledValue` and `Review` above it unchanged) with:

```ts
export type InnovationArea =
  | 'Seniorzy'
  | 'Niepełnosprawność'
  | 'Rodzina i opiekunowie'
  | 'Zdrowie psychiczne'
  | 'Społeczność lokalna';

export type InnovationKind = 'usługa' | 'metoda' | 'narzędzie';

/** Yearly cost: low up to 10 000 zł, mid up to 50 000 zł, high above. */
export type CostBand = 'low' | 'mid' | 'high';

/** What the library tile and its filters need. */
export interface InnovationSummary {
  readonly id: string;
  readonly name: string;
  readonly area: InnovationArea;
  readonly kind: InnovationKind;
  readonly summary: string;
  /** `MM.YYYY` */
  readonly verified: string;
  readonly cost: string;
  readonly costBand: CostBand;
  /** One decimal with a comma, e.g. `4,6`. */
  readonly rating: string;
  readonly reviewCount: number;
  readonly seeksTesters: boolean;
  readonly hasVideo: boolean;
}

export interface Innovation extends InnovationSummary {
  readonly category: string;
  readonly author: string;
  readonly incubator: string;
  readonly testerNote: string;
  readonly facts: readonly LabelledValue[];
  readonly materials: readonly string[];
  readonly steps: readonly string[];
  readonly fundingProgrammes: readonly string[];
  readonly fundingNote: string;
  readonly reviews: readonly Review[];
}
```

- [ ] **Step 4: Move the existing record and write the data files**

Delete `src/api/mock/data/innovations.ts` with `git rm`. Create `src/api/mock/data/innovations/seniorzy.ts`. Its first record is the existing "telefony" record with four new fields; it is also the template for every other record:

```ts
import type { Innovation } from '../../../types';

export const telefonyZyczliwosci: Innovation = {
  id: 'telefony-zyczliwosci',
  name: 'Sąsiedzkie Telefony Życzliwości',
  area: 'Seniorzy',
  kind: 'usługa',
  category: 'Seniorzy · usługa',
  summary:
    'Wolontariusze codziennie dzwonią do samotnych seniorów i reagują, gdy coś ich niepokoi.',
  verified: '05.2026',
  cost: 'ok. 8–15 tys. zł / rok',
  costBand: 'mid',
  seeksTesters: true,
  hasVideo: true,
  author: 'Stowarzyszenie Dobry Sąsiad',
  incubator: 'Inkubator Innowacji Społecznych „Most”',
  rating: '4,6',
  reviewCount: 12,
  testerNote: 'Zostało 6 miejsc dla testerów · do 30.11.2026',
  facts: [
    {
      label: 'Problem',
      value:
        'Samotność i brak codziennego kontaktu u osób starszych, zwłaszcza w małych miejscowościach.',
    },
    { label: 'Grupa docelowa', value: 'Seniorzy 65+ mieszkający samotnie.' },
    {
      label: 'Kto może skorzystać',
      value: 'OPS/GOPS, organizacje pozarządowe, parafie, kluby seniora.',
    },
    {
      label: 'Składowe',
      value:
        'Grafik codziennych rozmów, wolontariusze, koordynator, szkolenie, procedura na sytuacje niepokojące.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 8–15 tys. zł rocznie. Koordynator na 1/4 etatu i 6–10 wolontariuszy.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz podręcznik, wyznacz koordynatora, zgłoś się do autora po bezpłatne szkolenie online.',
    },
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
    {
      heading: '5 – bardzo pomogło · GOPS, gmina wiejska',
      quote: 'Ruszyliśmy w miesiąc. Seniorzy czekają na telefon jak na wizytę.',
    },
    {
      heading: '4 – pomogło · NGO, miasto',
      quote: 'Warto od razu zaplanować szkolenie wolontariuszy.',
    },
  ],
};
```

Do not change any text of this record: existing tests assert on it.

Write the other 11 records as separate exported constants, each a complete object literal (no `...spread` of another record). Place them by area:

| File | Exported constants |
|---|---|
| `seniorzy.ts` | `telefonyZyczliwosci`, `mobilnaKawiarenka`, `cyfrowyWnuk` |
| `niepelnosprawnosc.ts` | `asystentNaGodziny`, `mapaBarier`, `pracaNaProbe` |
| `rodzina.ts` | `wytchnieniowaSobota`, `kragOpiekunow` |
| `zdrowie-psychiczne.ts` | `pierwszaRozmowa`, `termometrNastroju` |
| `spolecznosc.ts` | `sasiedzkaWypozyczalnia`, `lawkaDialogu` |

For each record:

- `id`, `name`, `area`, `kind`, `verified`, `cost`, `costBand`, `rating`, `reviewCount`, `seeksTesters`, `hasVideo` come from the matching `EXPECTED` row in the test, in that column order.
- `summary` is the matching `SUMMARIES` entry, verbatim.
- `category` is `` `${area} · ${kind}` `` written out as a literal string.
- `facts` has exactly the six labels of the template, in the same order, each with a one- or two-sentence value specific to this innovation. The "Koszt i kadra" value restates the `cost` figure and names the staff needed.
- `materials`: 2–3 entries in the template's format `Nazwa (FORMAT, rozmiar)`.
- `steps`: 3–4 imperative sentences addressed to a municipal social-services worker.
- `fundingProgrammes`: 1–2 entries; mark invented programme names with `(przykład)`.
- `fundingNote`: `Sprawdzono <verified>. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.` with this record's `verified` value.
- `reviews`: exactly 2, headings in the template's format `<ocena 3–5> – <bardzo pomogło | pomogło | częściowo pomogło> · <typ instytucji>, <typ gminy>`.
- `author` and `incubator`: fictional Polish organisation names; vary the authors, reuse 2–3 incubator names.
- `testerNote`: for the four records with `seeksTesters: true` use the template's format `Zostało N miejsc dla testerów · do DD.MM.2026`; for all others use `''`.
- Tone and vocabulary match the template: plain Polish, concrete, no marketing language, rural Małopolska setting.

Then create `src/api/mock/data/innovations/index.ts`. The order of this list is the order `EXPECTED` asserts:

```ts
import type { Innovation } from '../../../types';
import {
  asystentNaGodziny,
  mapaBarier,
  pracaNaProbe,
} from './niepelnosprawnosc';
import { kragOpiekunow, wytchnieniowaSobota } from './rodzina';
import {
  cyfrowyWnuk,
  mobilnaKawiarenka,
  telefonyZyczliwosci,
} from './seniorzy';
import { lawkaDialogu, sasiedzkaWypozyczalnia } from './spolecznosc';
import { pierwszaRozmowa, termometrNastroju } from './zdrowie-psychiczne';

const records: readonly Innovation[] = [
  telefonyZyczliwosci,
  mobilnaKawiarenka,
  cyfrowyWnuk,
  asystentNaGodziny,
  mapaBarier,
  pracaNaProbe,
  wytchnieniowaSobota,
  kragOpiekunow,
  pierwszaRozmowa,
  termometrNastroju,
  sasiedzkaWypozyczalnia,
  lawkaDialogu,
];

export const innovations: Readonly<Record<string, Innovation>> =
  Object.fromEntries(
    records.map((item: Innovation): [string, Innovation] => [item.id, item]),
  );
```

- [ ] **Step 5: Run the tests**

Run: `npx vitest run src/api/mock/data/innovations` — Expected: PASS (5 tests).

Run: `npx vitest run` — Expected: PASS, 17 files, 139 tests. The existing test "shows tester and video chips only when they apply" in `src/features/adaptation/adaptation.test.tsx` opens `mobilna-kawiarenka` and must still pass (`seeksTesters: false`, empty `testerNote`).

- [ ] **Step 6: Lint, format, typecheck**

Run: `npm run format && npm run lint && npm run typecheck` — Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A src/api
git commit -m "feat: add catalogue fields and twelve example innovations"
```

---

### Task 2: `listInnovations` in the API

**Files:**
- Modify: `src/api/HubApi.ts`
- Modify: `src/api/mock/createMockApi.ts`
- Test: `src/api/mock/createMockApi.test.ts`

**Interfaces:**
- Consumes: `InnovationSummary`, `Innovation` (Task 1); `innovations` record map (Task 1).
- Produces: `HubApi.listInnovations(signal?: AbortSignal): Promise<readonly InnovationSummary[]>` — every innovation, in data order, summary fields only.

- [ ] **Step 1: Write the failing tests**

In `src/api/mock/createMockApi.test.ts`, add `InnovationSummary` to the type import from `'../types'`, and add inside the `describe` block:

```ts
  it('lists a summary for every innovation and each one opens', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const list: readonly InnovationSummary[] = await api.listInnovations();
    expect(list).toHaveLength(12);
    expect(list[0]).toEqual({
      id: 'telefony-zyczliwosci',
      name: 'Sąsiedzkie Telefony Życzliwości',
      area: 'Seniorzy',
      kind: 'usługa',
      summary:
        'Wolontariusze codziennie dzwonią do samotnych seniorów i reagują, gdy coś ich niepokoi.',
      verified: '05.2026',
      cost: 'ok. 8–15 tys. zł / rok',
      costBand: 'mid',
      rating: '4,6',
      reviewCount: 12,
      seeksTesters: true,
      hasVideo: true,
    });
    for (const item of list) {
      expect((await api.getInnovation(item.id)).name).toBe(item.name);
    }
  });

  it('rejects listing innovations when the signal is already aborted', async (): Promise<void> => {
    const api: HubApi = createMockApi({ delayMs: 0 });
    const controller: AbortController = new AbortController();
    controller.abort();
    await expect(
      api.listInnovations(controller.signal),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/api/mock/createMockApi.test.ts` — Expected: FAIL, `api.listInnovations is not a function`.

- [ ] **Step 3: Implement**

In `src/api/HubApi.ts`, add `InnovationSummary` to the type import (alphabetical position, after `Innovation`) and add the method directly above `getInnovation`:

```ts
  listInnovations(
    signal?: AbortSignal,
  ): Promise<readonly InnovationSummary[]>;
```

In `src/api/mock/createMockApi.ts`, add `InnovationSummary` to the type import, add this function above `createMockApi`:

```ts
/** Picks the summary fields, so the list never leaks card content. */
function toSummary(innovation: Innovation): InnovationSummary {
  return {
    id: innovation.id,
    name: innovation.name,
    area: innovation.area,
    kind: innovation.kind,
    summary: innovation.summary,
    verified: innovation.verified,
    cost: innovation.cost,
    costBand: innovation.costBand,
    rating: innovation.rating,
    reviewCount: innovation.reviewCount,
    seeksTesters: innovation.seeksTesters,
    hasVideo: innovation.hasVideo,
  };
}
```

and add the method directly above `getInnovation` in the returned object:

```ts
    async listInnovations(
      signal?: AbortSignal,
    ): Promise<readonly InnovationSummary[]> {
      await pause(signal);
      return Object.values(innovations).map(toSummary);
    },
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/api` — Expected: PASS.

Run: `npm run typecheck` — Expected: no errors. If another object implements `HubApi` and now lacks the method, add it there by delegating to `createMockApi`.

- [ ] **Step 5: Commit**

```bash
npm run format && npm run lint
git add src/api
git commit -m "feat: list innovation summaries through the hub api"
```

---

### Task 3: Library query and its URL form

**Files:**
- Create: `src/features/library/libraryQuery.ts`
- Test: `src/features/library/libraryQuery.test.ts`

**Interfaces:**
- Consumes: `InnovationArea`, `InnovationKind`, `CostBand` (Task 1).
- Produces (all from `libraryQuery.ts`):
  - `type LibrarySort = 'verified' | 'rating' | 'name'`
  - `interface LibraryQuery { text: string; areas: readonly InnovationArea[]; kinds: readonly InnovationKind[]; costs: readonly CostBand[]; seeksTesters: boolean; hasVideo: boolean; sort: LibrarySort }` (all `readonly`)
  - `interface Option<T> { value: T; slug: string; label: string }` (all `readonly`)
  - `AREA_OPTIONS`, `KIND_OPTIONS`, `COST_OPTIONS`, `SORT_OPTIONS`
  - `EMPTY_QUERY: LibraryQuery`
  - `parseQuery(params: URLSearchParams): LibraryQuery`
  - `toSearchParams(query: LibraryQuery): URLSearchParams`
  - `hasFilters(query: LibraryQuery): boolean` — true when search text or any filter is set; sort does not count
  - `toggleValue<T>(values: readonly T[], value: T): readonly T[]`

- [ ] **Step 1: Write the failing test**

Create `src/features/library/libraryQuery.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  EMPTY_QUERY,
  hasFilters,
  parseQuery,
  toggleValue,
  toSearchParams,
  type LibraryQuery,
} from './libraryQuery';

const FULL: LibraryQuery = {
  text: 'telefon senior',
  areas: ['Seniorzy', 'Rodzina i opiekunowie'],
  kinds: ['metoda'],
  costs: ['low', 'high'],
  seeksTesters: true,
  hasVideo: true,
  sort: 'rating',
};

describe('libraryQuery', (): void => {
  it('parses an empty query string to the defaults', (): void => {
    expect(parseQuery(new URLSearchParams(''))).toEqual(EMPTY_QUERY);
  });

  it('writes nothing for the defaults', (): void => {
    expect(toSearchParams(EMPTY_QUERY).toString()).toBe('');
  });

  it('writes every set field under its Polish parameter', (): void => {
    const params: URLSearchParams = toSearchParams(FULL);
    expect([...params.entries()]).toEqual([
      ['q', 'telefon senior'],
      ['obszar', 'seniorzy,rodzina'],
      ['typ', 'metoda'],
      ['koszt', 'do-10,ponad-50'],
      ['testerzy', '1'],
      ['film', '1'],
      ['sort', 'oceny'],
    ]);
  });

  it('round-trips through the query string', (): void => {
    const text: string = toSearchParams(FULL).toString();
    expect(parseQuery(new URLSearchParams(text))).toEqual(FULL);
  });

  it('ignores unknown values and keeps the known ones in option order', (): void => {
    const query: LibraryQuery = parseQuery(
      new URLSearchParams(
        'obszar=spolecznosc,xyz,seniorzy,seniorzy&typ=&koszt=tanio&sort=losowo&testerzy=tak&inne=1',
      ),
    );
    expect(query).toEqual({
      ...EMPTY_QUERY,
      areas: ['Seniorzy', 'Społeczność lokalna'],
    });
  });

  it('counts search text and filters, but not sort, as filters', (): void => {
    expect(hasFilters(EMPTY_QUERY)).toBe(false);
    expect(hasFilters({ ...EMPTY_QUERY, sort: 'name' })).toBe(false);
    expect(hasFilters({ ...EMPTY_QUERY, text: '   ' })).toBe(false);
    expect(hasFilters({ ...EMPTY_QUERY, text: 'a' })).toBe(true);
    expect(hasFilters({ ...EMPTY_QUERY, kinds: ['usługa'] })).toBe(true);
    expect(hasFilters({ ...EMPTY_QUERY, hasVideo: true })).toBe(true);
  });

  it('toggles a value in and out of a list', (): void => {
    expect(toggleValue(['a'], 'b')).toEqual(['a', 'b']);
    expect(toggleValue(['a', 'b'], 'a')).toEqual(['b']);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/features/library/libraryQuery.test.ts` — Expected: FAIL, module not found.

- [ ] **Step 3: Implement**

Create `src/features/library/libraryQuery.ts`:

```ts
import type { CostBand, InnovationArea, InnovationKind } from '../../api/types';

export type LibrarySort = 'verified' | 'rating' | 'name';

export interface LibraryQuery {
  readonly text: string;
  readonly areas: readonly InnovationArea[];
  readonly kinds: readonly InnovationKind[];
  readonly costs: readonly CostBand[];
  readonly seeksTesters: boolean;
  readonly hasVideo: boolean;
  readonly sort: LibrarySort;
}

export interface Option<T> {
  readonly value: T;
  /** The value's form in the URL. */
  readonly slug: string;
  readonly label: string;
}

export const AREA_OPTIONS: readonly Option<InnovationArea>[] = [
  { value: 'Seniorzy', slug: 'seniorzy', label: 'Seniorzy' },
  {
    value: 'Niepełnosprawność',
    slug: 'niepelnosprawnosc',
    label: 'Niepełnosprawność',
  },
  {
    value: 'Rodzina i opiekunowie',
    slug: 'rodzina',
    label: 'Rodzina i opiekunowie',
  },
  {
    value: 'Zdrowie psychiczne',
    slug: 'zdrowie-psychiczne',
    label: 'Zdrowie psychiczne',
  },
  {
    value: 'Społeczność lokalna',
    slug: 'spolecznosc',
    label: 'Społeczność lokalna',
  },
];

export const KIND_OPTIONS: readonly Option<InnovationKind>[] = [
  { value: 'usługa', slug: 'usluga', label: 'Usługa' },
  { value: 'metoda', slug: 'metoda', label: 'Metoda' },
  { value: 'narzędzie', slug: 'narzedzie', label: 'Narzędzie' },
];

export const COST_OPTIONS: readonly Option<CostBand>[] = [
  { value: 'low', slug: 'do-10', label: 'do 10 tys. zł' },
  { value: 'mid', slug: '10-50', label: '10–50 tys. zł' },
  { value: 'high', slug: 'ponad-50', label: 'ponad 50 tys. zł' },
];

export const SORT_OPTIONS: readonly Option<LibrarySort>[] = [
  { value: 'verified', slug: 'zweryfikowane', label: 'Ostatnio zweryfikowane' },
  { value: 'rating', slug: 'oceny', label: 'Najlepiej oceniane' },
  { value: 'name', slug: 'nazwa', label: 'Alfabetycznie' },
];

export const EMPTY_QUERY: LibraryQuery = {
  text: '',
  areas: [],
  kinds: [],
  costs: [],
  seeksTesters: false,
  hasVideo: false,
  sort: 'verified',
};

/** Known slugs only, de-duplicated, in option order. */
function parseList<T>(
  raw: string | null,
  options: readonly Option<T>[],
): readonly T[] {
  if (raw === null) {
    return [];
  }
  const slugs: readonly string[] = raw.split(',');
  return options
    .filter((option: Option<T>): boolean => slugs.includes(option.slug))
    .map((option: Option<T>): T => option.value);
}

function writeList<T>(
  values: readonly T[],
  options: readonly Option<T>[],
): string {
  return options
    .filter((option: Option<T>): boolean => values.includes(option.value))
    .map((option: Option<T>): string => option.slug)
    .join(',');
}

export function parseQuery(params: URLSearchParams): LibraryQuery {
  const sortSlug: string | null = params.get('sort');
  const sort: Option<LibrarySort> | undefined = SORT_OPTIONS.find(
    (option: Option<LibrarySort>): boolean => option.slug === sortSlug,
  );
  return {
    text: params.get('q') ?? '',
    areas: parseList(params.get('obszar'), AREA_OPTIONS),
    kinds: parseList(params.get('typ'), KIND_OPTIONS),
    costs: parseList(params.get('koszt'), COST_OPTIONS),
    seeksTesters: params.get('testerzy') === '1',
    hasVideo: params.get('film') === '1',
    sort: sort?.value ?? EMPTY_QUERY.sort,
  };
}

/** Defaults are left out, so the unfiltered library has no query string. */
export function toSearchParams(query: LibraryQuery): URLSearchParams {
  const params: URLSearchParams = new URLSearchParams();
  if (query.text !== '') {
    params.set('q', query.text);
  }
  const lists: readonly (readonly [string, string])[] = [
    ['obszar', writeList(query.areas, AREA_OPTIONS)],
    ['typ', writeList(query.kinds, KIND_OPTIONS)],
    ['koszt', writeList(query.costs, COST_OPTIONS)],
  ];
  for (const [name, value] of lists) {
    if (value !== '') {
      params.set(name, value);
    }
  }
  if (query.seeksTesters) {
    params.set('testerzy', '1');
  }
  if (query.hasVideo) {
    params.set('film', '1');
  }
  if (query.sort !== EMPTY_QUERY.sort) {
    params.set('sort', writeList([query.sort], SORT_OPTIONS));
  }
  return params;
}

export function hasFilters(query: LibraryQuery): boolean {
  return (
    query.text.trim() !== '' ||
    query.areas.length > 0 ||
    query.kinds.length > 0 ||
    query.costs.length > 0 ||
    query.seeksTesters ||
    query.hasVideo
  );
}

export function toggleValue<T>(values: readonly T[], value: T): readonly T[] {
  return values.includes(value)
    ? values.filter((item: T): boolean => item !== value)
    : [...values, value];
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/features/library/libraryQuery.test.ts` — Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
npm run format && npm run lint && npm run typecheck
git add src/features/library
git commit -m "feat: add library query with url parsing"
```

---

### Task 4: Filtering, sorting, counts and labels

**Files:**
- Create: `src/features/library/plural.ts`, `src/features/library/filterInnovations.ts`
- Test: `src/features/library/plural.test.ts`, `src/features/library/filterInnovations.test.ts`

**Interfaces:**
- Consumes: `InnovationSummary`, `InnovationArea` (Task 1); `LibraryQuery`, `LibrarySort`, `AREA_OPTIONS`, `EMPTY_QUERY` (Task 3).
- Produces:
  - `plural(count: number, forms: readonly [one: string, few: string, many: string]): string` from `plural.ts`
  - from `filterInnovations.ts`:
    - `filterInnovations(items: readonly InnovationSummary[], query: LibraryQuery): readonly InnovationSummary[]`
    - `sortInnovations(items: readonly InnovationSummary[], sort: LibrarySort): readonly InnovationSummary[]` (returns a new array)
    - `countByArea(items: readonly InnovationSummary[], query: LibraryQuery): Readonly<Record<InnovationArea, number>>`
    - `resultLabel(shown: number, total: number): string`

- [ ] **Step 1: Write the failing tests**

Create `src/features/library/plural.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { plural } from './plural';

const FORMS: readonly [string, string, string] = [
  'innowacja',
  'innowacje',
  'innowacji',
];

describe('plural', (): void => {
  it.each([
    [0, 'innowacji'],
    [1, 'innowacja'],
    [2, 'innowacje'],
    [4, 'innowacje'],
    [5, 'innowacji'],
    [11, 'innowacji'],
    [12, 'innowacji'],
    [14, 'innowacji'],
    [21, 'innowacji'],
    [22, 'innowacje'],
    [25, 'innowacji'],
    [112, 'innowacji'],
  ])('picks the form for %i', (count: number, expected: string): void => {
    expect(plural(count, FORMS)).toBe(expected);
  });
});
```

Create `src/features/library/filterInnovations.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import type { InnovationSummary } from '../../api/types';
import {
  countByArea,
  filterInnovations,
  resultLabel,
  sortInnovations,
} from './filterInnovations';
import { EMPTY_QUERY, type LibraryQuery } from './libraryQuery';

function item(overrides: Partial<InnovationSummary>): InnovationSummary {
  return {
    id: 'x',
    name: 'X',
    area: 'Seniorzy',
    kind: 'usługa',
    summary: '',
    verified: '01.2026',
    cost: '',
    costBand: 'low',
    rating: '4,0',
    reviewCount: 1,
    seeksTesters: false,
    hasVideo: false,
    ...overrides,
  };
}

const telefony: InnovationSummary = item({
  id: 'telefony',
  name: 'Sąsiedzkie Telefony Życzliwości',
  summary: 'Wolontariusze dzwonią do samotnych seniorów.',
  kind: 'usługa',
  costBand: 'mid',
  verified: '05.2026',
  rating: '4,6',
  reviewCount: 12,
  seeksTesters: true,
  hasVideo: true,
});
const lawka: InnovationSummary = item({
  id: 'lawka',
  name: 'Ławka Dialogu',
  summary: 'Rozmowy sąsiadów o sprawach wsi.',
  area: 'Społeczność lokalna',
  kind: 'metoda',
  costBand: 'low',
  verified: '12.2025',
  rating: '4,6',
  reviewCount: 3,
});
const rozmowa: InnovationSummary = item({
  id: 'rozmowa',
  name: 'Pierwsza Rozmowa',
  summary: 'Rozmowa z psychologiem bez kolejki.',
  area: 'Zdrowie psychiczne',
  kind: 'usługa',
  costBand: 'high',
  verified: '03.2026',
  rating: '4,5',
  reviewCount: 10,
  hasVideo: true,
});
const cwiczenia: InnovationSummary = item({
  id: 'cwiczenia',
  name: 'Ćwiczenia na Ławce',
  summary: 'Gimnastyka dla seniorów w parku.',
  area: 'Seniorzy',
  kind: 'metoda',
  costBand: 'low',
  verified: '03.2026',
  rating: '3,9',
  reviewCount: 2,
});

const ALL: readonly InnovationSummary[] = [telefony, lawka, rozmowa, cwiczenia];

function ids(items: readonly InnovationSummary[]): readonly string[] {
  return items.map((entry: InnovationSummary): string => entry.id);
}

function run(patch: Partial<LibraryQuery>): readonly string[] {
  return ids(filterInnovations(ALL, { ...EMPTY_QUERY, ...patch }));
}

describe('filterInnovations', (): void => {
  it('returns everything for the empty query', (): void => {
    expect(run({})).toEqual(['telefony', 'lawka', 'rozmowa', 'cwiczenia']);
  });

  it('searches name and summary without case or Polish diacritics', (): void => {
    expect(run({ text: 'zyczliwosci' })).toEqual(['telefony']);
    expect(run({ text: 'ŻYCZLIWOŚCI' })).toEqual(['telefony']);
    expect(run({ text: 'lawka' })).toEqual(['lawka']);
    expect(run({ text: 'ławce' })).toEqual(['cwiczenia']);
    expect(run({ text: 'psychologiem' })).toEqual(['rozmowa']);
  });

  it('requires every word of the search text', (): void => {
    expect(run({ text: 'rozmow' })).toEqual(['lawka', 'rozmowa']);
    expect(run({ text: '  rozmow   wsi ' })).toEqual(['lawka']);
    expect(run({ text: 'rozmow senior' })).toEqual([]);
  });

  it('combines values of one group with OR', (): void => {
    expect(run({ areas: ['Seniorzy', 'Zdrowie psychiczne'] })).toEqual([
      'telefony',
      'rozmowa',
      'cwiczenia',
    ]);
    expect(run({ costs: ['low', 'high'] })).toEqual([
      'lawka',
      'rozmowa',
      'cwiczenia',
    ]);
  });

  it('combines groups, toggles and search with AND', (): void => {
    expect(run({ areas: ['Seniorzy'], kinds: ['metoda'] })).toEqual([
      'cwiczenia',
    ]);
    expect(run({ kinds: ['usługa'], hasVideo: true })).toEqual([
      'telefony',
      'rozmowa',
    ]);
    expect(run({ seeksTesters: true, hasVideo: true })).toEqual(['telefony']);
    expect(run({ text: 'senior', costs: ['mid'] })).toEqual(['telefony']);
  });

  it('filters each cost band', (): void => {
    expect(run({ costs: ['low'] })).toEqual(['lawka', 'cwiczenia']);
    expect(run({ costs: ['mid'] })).toEqual(['telefony']);
    expect(run({ costs: ['high'] })).toEqual(['rozmowa']);
  });
});

describe('sortInnovations', (): void => {
  it('sorts by verification date across a year boundary, newest first, then by name', (): void => {
    expect(ids(sortInnovations(ALL, 'verified'))).toEqual([
      'telefony',
      'cwiczenia',
      'rozmowa',
      'lawka',
    ]);
  });

  it('sorts by rating, then review count', (): void => {
    expect(ids(sortInnovations(ALL, 'rating'))).toEqual([
      'telefony',
      'lawka',
      'rozmowa',
      'cwiczenia',
    ]);
  });

  it('sorts by name with Polish collation', (): void => {
    expect(ids(sortInnovations(ALL, 'name'))).toEqual([
      'cwiczenia',
      'lawka',
      'rozmowa',
      'telefony',
    ]);
  });

  it('does not change its input', (): void => {
    const input: readonly InnovationSummary[] = [lawka, telefony];
    sortInnovations(input, 'name');
    expect(ids(input)).toEqual(['lawka', 'telefony']);
  });
});

describe('countByArea', (): void => {
  it('counts per area under the other filters, ignoring the area selection', (): void => {
    expect(
      countByArea(ALL, {
        ...EMPTY_QUERY,
        areas: ['Zdrowie psychiczne'],
        kinds: ['metoda'],
      }),
    ).toEqual({
      Seniorzy: 1,
      Niepełnosprawność: 0,
      'Rodzina i opiekunowie': 0,
      'Zdrowie psychiczne': 0,
      'Społeczność lokalna': 1,
    });
  });
});

describe('resultLabel', (): void => {
  it('names the count and adds the total only when filtered', (): void => {
    expect(resultLabel(12, 12)).toBe('12 innowacji');
    expect(resultLabel(5, 12)).toBe('5 innowacji z 12');
    expect(resultLabel(3, 12)).toBe('3 innowacje z 12');
    expect(resultLabel(1, 12)).toBe('1 innowacja z 12');
    expect(resultLabel(0, 12)).toBe('0 innowacji z 12');
  });
});
```

Notes on the fixtures: in Polish collation "Ć" sorts after "C" and before "D", and "Ł" after "L" and before "M", so the name order is Ćwiczenia, Ławka, Pierwsza, Sąsiedzkie. `cwiczenia` and `rozmowa` share `03.2026`, so the name tie-break puts `cwiczenia` first. `telefony` and `lawka` share rating `4,6`; `telefony` has more reviews.

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/features/library` — Expected: `plural.test.ts` and `filterInnovations.test.ts` FAIL with module not found; `libraryQuery.test.ts` passes.

- [ ] **Step 3: Implement**

Create `src/features/library/plural.ts`:

```ts
/** Polish plural: 1 innowacja, 2–4 innowacje, 5–21 innowacji, 22 innowacje. */
export function plural(
  count: number,
  forms: readonly [one: string, few: string, many: string],
): string {
  const lastTwo: number = count % 100;
  const last: number = count % 10;
  if (count === 1) {
    return forms[0];
  }
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) {
    return forms[1];
  }
  return forms[2];
}
```

Create `src/features/library/filterInnovations.ts`:

```ts
import type { InnovationArea, InnovationSummary } from '../../api/types';
import {
  AREA_OPTIONS,
  type LibraryQuery,
  type LibrarySort,
  type Option,
} from './libraryQuery';
import { plural } from './plural';

/** Lower case without diacritics. "ł" has no decomposed form, so it is mapped by hand. */
function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ł/g, 'l');
}

function matches(item: InnovationSummary, query: LibraryQuery): boolean {
  const haystack: string = normalise(`${item.name} ${item.summary}`);
  const words: readonly string[] = normalise(query.text)
    .split(/\s+/)
    .filter((word: string): boolean => word !== '');
  return (
    words.every((word: string): boolean => haystack.includes(word)) &&
    (query.areas.length === 0 || query.areas.includes(item.area)) &&
    (query.kinds.length === 0 || query.kinds.includes(item.kind)) &&
    (query.costs.length === 0 || query.costs.includes(item.costBand)) &&
    (!query.seeksTesters || item.seeksTesters) &&
    (!query.hasVideo || item.hasVideo)
  );
}

export function filterInnovations(
  items: readonly InnovationSummary[],
  query: LibraryQuery,
): readonly InnovationSummary[] {
  return items.filter((item: InnovationSummary): boolean =>
    matches(item, query),
  );
}

const collator: Intl.Collator = new Intl.Collator('pl');

/** `MM.YYYY` as a month count, so dates compare as numbers. */
function verifiedMonths(verified: string): number {
  return Number(verified.slice(3)) * 12 + Number(verified.slice(0, 2));
}

function ratingValue(rating: string): number {
  return Number(rating.replace(',', '.'));
}

function byName(a: InnovationSummary, b: InnovationSummary): number {
  return collator.compare(a.name, b.name);
}

const COMPARATORS: Readonly<
  Record<LibrarySort, (a: InnovationSummary, b: InnovationSummary) => number>
> = {
  verified: (a: InnovationSummary, b: InnovationSummary): number =>
    verifiedMonths(b.verified) - verifiedMonths(a.verified),
  rating: (a: InnovationSummary, b: InnovationSummary): number =>
    ratingValue(b.rating) - ratingValue(a.rating) ||
    b.reviewCount - a.reviewCount,
  name: byName,
};

export function sortInnovations(
  items: readonly InnovationSummary[],
  sort: LibrarySort,
): readonly InnovationSummary[] {
  const compare: (a: InnovationSummary, b: InnovationSummary) => number =
    COMPARATORS[sort];
  return [...items].sort(
    (a: InnovationSummary, b: InnovationSummary): number =>
      compare(a, b) || byName(a, b),
  );
}

/** How many items each area would show under every filter except the area one. */
export function countByArea(
  items: readonly InnovationSummary[],
  query: LibraryQuery,
): Readonly<Record<InnovationArea, number>> {
  const pool: readonly InnovationSummary[] = filterInnovations(items, {
    ...query,
    areas: [],
  });
  const counts: Record<InnovationArea, number> = {
    Seniorzy: 0,
    Niepełnosprawność: 0,
    'Rodzina i opiekunowie': 0,
    'Zdrowie psychiczne': 0,
    'Społeczność lokalna': 0,
  };
  for (const option of AREA_OPTIONS) {
    const current: Option<InnovationArea> = option;
    counts[current.value] = pool.filter(
      (item: InnovationSummary): boolean => item.area === current.value,
    ).length;
  }
  return counts;
}

export function resultLabel(shown: number, total: number): string {
  const noun: string = plural(shown, ['innowacja', 'innowacje', 'innowacji']);
  const base: string = `${String(shown)} ${noun}`;
  return shown === total ? base : `${base} z ${String(total)}`;
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run src/features/library` — Expected: PASS (3 files).

- [ ] **Step 5: Commit**

```bash
npm run format && npm run lint && npm run typecheck
git add src/features/library
git commit -m "feat: filter, sort and count library innovations"
```

---

### Task 5: The library screen

**Files:**
- Create: `src/features/library/useLibraryQuery.ts`
- Create: `src/features/library/LibraryFilters.tsx`, `LibraryFilters.module.css`
- Create: `src/features/library/InnovationTile.tsx`, `InnovationTile.module.css`
- Create: `src/features/library/LibraryScreen.tsx`, `LibraryScreen.module.css`
- Modify: `src/app/routes.tsx`
- Modify: `src/shell/navigation.ts` (remove the `/biblioteka` entry from `STUB_TITLES`)
- Test: `src/features/library/library.test.tsx`, `src/shell/shell.test.tsx`

**Interfaces:**
- Consumes:
  - `useApi(): HubApi` from `src/app/contexts`; `api.listInnovations(signal)` (Task 2)
  - `useAsync<T>(key: string, load: (signal: AbortSignal) => Promise<T>): { state: AsyncState<T>; retry: () => void }` from `src/app/useAsync`; `state.status` is `'loading' | 'ready' | 'error'`, with `state.data` or `state.message`
  - `ChoiceChip({ label, selected, onToggle })`, `Button({ variant })`, `buttonClass(variant)`, `LoadError({ message, onRetry })`, `Skeleton({ width, height })` from `src/ui`
  - everything Task 3 and Task 4 produce
  - `renderApp(path, { api?, persona? }): { api, user, router }` from `src/test/renderApp`
- Produces: `LibraryScreen` rendered at `/biblioteka`.

Design note for the search field: React Router applies navigations inside a transition, so the address can lag a keystroke behind. The hook therefore keeps the search text in its own state, uses it for filtering at once, and mirrors it to the address. It re-reads the text from the address only when the location changes through a navigation that is not its own `replace` (for example a click on the top-bar item while a search is active).

- [ ] **Step 1: Write the failing tests**

Create `src/features/library/library.test.tsx`:

```tsx
import { screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { HubApi } from '../../api/HubApi';
import { createMockApi } from '../../api/mock/createMockApi';
import type { InnovationSummary } from '../../api/types';
import { renderApp } from '../../test/renderApp';

async function tiles(): Promise<readonly HTMLElement[]> {
  const list: HTMLElement = await screen.findByRole('list', {
    name: 'Innowacje',
  });
  return within(list).getAllByRole('listitem');
}

function names(items: readonly HTMLElement[]): readonly string[] {
  return items.map((tile: HTMLElement): string =>
    String(within(tile).getByRole('heading', { level: 2 }).textContent),
  );
}

function chip(group: string, name: RegExp): HTMLElement {
  return within(screen.getByRole('group', { name: group })).getByRole(
    'button',
    { name },
  );
}

describe('innovation library', (): void => {
  it('lists every innovation, newest verification first', async (): Promise<void> => {
    renderApp('/biblioteka');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Biblioteka innowacji' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Wczytujemy bibliotekę…')).toBeInTheDocument();
    const all: readonly HTMLElement[] = await tiles();
    expect(all).toHaveLength(12);
    expect(names(all).slice(0, 3)).toEqual([
      'Wytchnieniowa Sobota',
      'Sąsiedzkie Telefony Życzliwości',
      'Asystent na Godziny',
    ]);
    expect(screen.getByText('12 innowacji')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Wyczyść filtry' }),
    ).not.toBeInTheDocument();
  });

  it('shows the catalogue fields on a tile', async (): Promise<void> => {
    renderApp('/biblioteka');
    const tile: HTMLElement | undefined = (await tiles())[1];
    expect(tile).toBeDefined();
    if (tile === undefined) {
      return;
    }
    expect(within(tile).getByText('Seniorzy · usługa')).toBeInTheDocument();
    expect(
      within(tile).getByText(
        'Wolontariusze codziennie dzwonią do samotnych seniorów i reagują, gdy coś ich niepokoi.',
      ),
    ).toBeInTheDocument();
    expect(
      within(tile).getByText('✓ Zweryfikowano 05.2026'),
    ).toBeInTheDocument();
    expect(
      within(tile).getByText('ok. 8–15 tys. zł / rok'),
    ).toBeInTheDocument();
    expect(within(tile).getByText('◎ Szuka testerów')).toBeInTheDocument();
    expect(within(tile).getByText('▶ Film')).toBeInTheDocument();
    expect(within(tile).getByText('★ 4,6 · 12 opinii')).toBeInTheDocument();
  });

  it('narrows the list with chips and keeps the filters in the address', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.click(chip('Obszar', /^Seniorzy · 3$/));
    expect(await screen.findByText('3 innowacje z 12')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?obszar=seniorzy');
    await user.click(chip('Typ', /^Metoda$/));
    expect(await screen.findByText('1 innowacja z 12')).toBeInTheDocument();
    expect(names(await tiles())).toEqual(['Cyfrowy Wnuk']);
    expect(chip('Obszar', /^Zdrowie psychiczne · 0$/)).toBeInTheDocument();
    expect(chip('Obszar', /Seniorzy · 1$/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('filters by the feature toggles and cost', async (): Promise<void> => {
    const { user } = renderApp('/biblioteka');
    await tiles();
    await user.click(chip('Cechy', /Szuka testerów/));
    expect(await screen.findByText('4 innowacje z 12')).toBeInTheDocument();
    await user.click(chip('Koszt roczny', /^do 10 tys\. zł$/));
    expect(await screen.findByText('2 innowacje z 12')).toBeInTheDocument();
    expect(names(await tiles())).toEqual(['Mapa Barier', 'Termometr Nastroju']);
  });

  it('searches without Polish diacritics', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.type(
      screen.getByRole('searchbox', { name: 'Szukaj w bibliotece' }),
      'zyczliwosci',
    );
    expect(await screen.findByText('1 innowacja z 12')).toBeInTheDocument();
    expect(names(await tiles())).toEqual(['Sąsiedzkie Telefony Życzliwości']);
    expect(router.state.location.search).toBe('?q=zyczliwosci');
  });

  it('sorts the list', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.selectOptions(
      screen.getByRole('combobox', { name: 'Sortuj' }),
      'Najlepiej oceniane',
    );
    expect(router.state.location.search).toBe('?sort=oceny');
    expect(names(await tiles()).slice(0, 5)).toEqual([
      'Wytchnieniowa Sobota',
      'Asystent na Godziny',
      'Sąsiedzkie Telefony Życzliwości',
      'Pierwsza Rozmowa',
      'Praca na Próbę',
    ]);
  });

  it('opens with the filters from the address', async (): Promise<void> => {
    renderApp('/biblioteka?koszt=ponad-50&sort=nazwa&q=&obszar=nieznany');
    expect(names(await tiles())).toEqual([
      'Asystent na Godziny',
      'Mobilna Kawiarenka Seniora',
      'Pierwsza Rozmowa',
    ]);
    expect(chip('Koszt roczny', /ponad 50 tys\. zł$/)).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('combobox', { name: 'Sortuj' })).toHaveValue(
      'name',
    );
  });

  it('explains an empty result and clears the filters, keeping the sort', async (): Promise<void> => {
    const { user, router } = renderApp(
      '/biblioteka?obszar=zdrowie-psychiczne&typ=metoda&sort=nazwa&q=x',
    );
    expect(
      await screen.findByRole('heading', {
        level: 2,
        name: 'Żadna innowacja nie pasuje do tych filtrów',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('0 innowacji z 12')).toBeInTheDocument();
    const main: HTMLElement = screen.getByRole('main');
    expect(
      within(main).getByRole('link', { name: 'Zgłoś pomysł' }),
    ).toHaveAttribute('href', '/zglos-pomysl');
    await user.click(screen.getByRole('button', { name: 'Wyczyść filtry' }));
    expect(await tiles()).toHaveLength(12);
    expect(router.state.location.search).toBe('?sort=nazwa');
    const search: HTMLElement = screen.getByRole('searchbox', {
      name: 'Szukaj w bibliotece',
    });
    expect(search).toHaveValue('');
    expect(search).toHaveFocus();
  });

  it('opens a card and comes back to the same filtered list', async (): Promise<void> => {
    const { user, router } = renderApp('/biblioteka');
    await tiles();
    await user.click(chip('Obszar', /^Zdrowie psychiczne · 2$/));
    expect(await screen.findByText('2 innowacje z 12')).toBeInTheDocument();
    await user.click(chip('Typ', /^Usługa$/));
    expect(await screen.findByText('1 innowacja z 12')).toBeInTheDocument();
    await user.click(screen.getByRole('link', { name: 'Pierwsza Rozmowa' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Pierwsza Rozmowa' }),
    ).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/innowacje/pierwsza-rozmowa');
    await router.navigate(-1);
    expect(names(await tiles())).toEqual(['Pierwsza Rozmowa']);
    expect(router.state.location.search).toBe(
      '?obszar=zdrowie-psychiczne&typ=usluga',
    );
  });

  it('offers a retry when the list fails to load', async (): Promise<void> => {
    const real: HubApi = createMockApi({ delayMs: 0 });
    let calls: number = 0;
    const api: HubApi = {
      ...real,
      listInnovations(
        signal?: AbortSignal,
      ): Promise<readonly InnovationSummary[]> {
        calls += 1;
        return calls === 1
          ? Promise.reject(new Error('Brak połączenia.'))
          : real.listInnovations(signal);
      },
    };
    const { user } = renderApp('/biblioteka?obszar=seniorzy', { api });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Brak połączenia.',
    );
    await user.click(screen.getByRole('button', { name: 'Spróbuj ponownie' }));
    expect(await tiles()).toHaveLength(3);
  });
});
```

In `src/shell/shell.test.tsx`, add inside the `describe('shell', …)` block:

```tsx
  it('opens the innovation library from the top bar', async (): Promise<void> => {
    const { user } = renderApp('/nabory');
    const nav: HTMLElement = screen.getByRole('navigation', { name: 'Główna' });
    await user.click(
      within(nav).getByRole('link', { name: 'Biblioteka innowacji' }),
    );
    expect(
      await screen.findByRole('searchbox', { name: 'Szukaj w bibliotece' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Ta część nie jest dostępna w wersji demonstracyjnej.'),
    ).not.toBeInTheDocument();
    expect(
      within(nav).getByRole('link', { name: 'Biblioteka innowacji' }),
    ).toHaveAttribute('aria-current', 'page');
  });
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/features/library/library.test.tsx src/shell/shell.test.tsx` — Expected: all 10 library tests and the new shell test FAIL (the stub page has no list or search box); the other shell tests pass.

- [ ] **Step 3: Write the hook**

Create `src/features/library/useLibraryQuery.ts`:

```ts
import { useState } from 'react';
import {
  NavigationType,
  useLocation,
  useNavigationType,
  useSearchParams,
} from 'react-router';

import { parseQuery, toSearchParams, type LibraryQuery } from './libraryQuery';

export interface LibraryQueryState {
  readonly query: LibraryQuery;
  readonly setQuery: (next: LibraryQuery) => void;
}

/**
 * The library's filters, stored in the address. A change replaces the
 * history entry, so "back" from a card returns to the list as it was.
 *
 * The search text is also held in state: the address updates in a
 * transition and must not lag behind typing. The state follows the address
 * again whenever the location changes by a navigation other than our own
 * replace.
 */
export function useLibraryQuery(): LibraryQueryState {
  const [params, setParams] = useSearchParams();
  const location: ReturnType<typeof useLocation> = useLocation();
  const navigationType: NavigationType = useNavigationType();
  const stored: LibraryQuery = parseQuery(params);
  const [text, setText] = useState<string>(stored.text);
  const [entryKey, setEntryKey] = useState<string>(location.key);

  if (
    navigationType !== NavigationType.Replace &&
    location.key !== entryKey
  ) {
    setEntryKey(location.key);
    setText(stored.text);
  }

  function setQuery(next: LibraryQuery): void {
    setText(next.text);
    setParams(toSearchParams(next), { replace: true });
  }

  return { query: { ...stored, text }, setQuery };
}
```

The `if` block is React's documented "adjust state when a prop changes" pattern; it is conditional, so it cannot loop.

- [ ] **Step 4: Write the tile**

Create `src/features/library/InnovationTile.tsx`:

```tsx
import type { ReactElement } from 'react';
import { Link } from 'react-router';

import type { InnovationSummary } from '../../api/types';
import { cx } from '../../ui/cx';
import styles from './InnovationTile.module.css';
import { plural } from './plural';

interface InnovationTileProps {
  readonly innovation: InnovationSummary;
}

export function InnovationTile({
  innovation,
}: InnovationTileProps): ReactElement {
  const reviews: string = plural(innovation.reviewCount, [
    'opinia',
    'opinie',
    'opinii',
  ]);
  return (
    <li className={styles['tile']}>
      <span className={styles['category']}>
        {`${innovation.area} · ${innovation.kind}`}
      </span>
      <h2 className={styles['name']}>
        <Link to={`/innowacje/${innovation.id}`} className={styles['link']}>
          {innovation.name}
        </Link>
      </h2>
      <p className={styles['summary']}>{innovation.summary}</p>
      <div className={styles['tags']}>
        <span className={cx(styles['tag'], styles['verified'])}>
          {`✓ Zweryfikowano ${innovation.verified}`}
        </span>
        <span className={styles['tag']}>{innovation.cost}</span>
        {innovation.seeksTesters ? (
          <span className={cx(styles['tag'], styles['testers'])}>
            ◎ Szuka testerów
          </span>
        ) : null}
        {innovation.hasVideo ? (
          <span className={cx(styles['tag'], styles['video'])}>▶ Film</span>
        ) : null}
        <span className={styles['tag']}>
          {`★ ${innovation.rating} · ${String(innovation.reviewCount)} ${reviews}`}
        </span>
      </div>
    </li>
  );
}
```

Create `src/features/library/InnovationTile.module.css`:

```css
.tile {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  min-width: 0;
  padding: 1.375rem 1.5rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-white);
}

.tile:hover {
  border-color: var(--c-primary-line);
}

.category {
  color: var(--c-muted);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.name {
  font-size: 1.4375rem;
  font-weight: 600;
  line-height: 1.2;
}

.link {
  color: var(--c-ink);
  text-decoration: none;
}

.tile:hover .link {
  color: var(--c-primary-dark);
  text-decoration: underline;
}

/* The link covers the whole tile, so the tile is one click target. */
.link::after {
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  content: '';
}

.link:focus-visible {
  outline: none;
}

.link:focus-visible::after {
  outline: 2px solid var(--c-primary);
  outline-offset: 3px;
}

.summary {
  color: var(--c-ink-2);
  font-size: 1.0625rem;
  text-wrap: pretty;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  padding-top: 0.375rem;
}

.tag {
  padding: 0.25rem 0.625rem;
  border-radius: var(--radius);
  background: var(--c-surface);
  font-size: 0.9375rem;
  font-weight: 600;
}

.verified {
  background: transparent;
  padding-inline: 0;
  color: var(--c-success);
}

.testers {
  background: var(--c-success-tint);
  color: var(--c-success);
}

.video {
  background: var(--c-primary-tint);
  color: var(--c-primary-dark);
}
```

- [ ] **Step 5: Write the filters**

Create `src/features/library/LibraryFilters.tsx`:

```tsx
import {
  useId,
  type ChangeEvent,
  type ReactElement,
  type RefObject,
} from 'react';

import type {
  CostBand,
  InnovationArea,
  InnovationKind,
} from '../../api/types';
import { ChoiceChip } from '../../ui/ChoiceChip';
import styles from './LibraryFilters.module.css';
import {
  AREA_OPTIONS,
  COST_OPTIONS,
  KIND_OPTIONS,
  toggleValue,
  type LibraryQuery,
  type Option,
} from './libraryQuery';

interface ChipGroupProps<T> {
  readonly title: string;
  readonly options: readonly Option<T>[];
  readonly selected: readonly T[];
  readonly labelFor?: (option: Option<T>) => string;
  readonly onToggle: (value: T) => void;
}

function ChipGroup<T>({
  title,
  options,
  selected,
  labelFor,
  onToggle,
}: ChipGroupProps<T>): ReactElement {
  const titleId: string = useId();
  return (
    <div role="group" aria-labelledby={titleId} className={styles['group']}>
      <span id={titleId} className={styles['groupTitle']}>
        {title}
      </span>
      {options.map((option: Option<T>): ReactElement => (
        <ChoiceChip
          key={option.slug}
          label={labelFor === undefined ? option.label : labelFor(option)}
          selected={selected.includes(option.value)}
          onToggle={(): void => {
            onToggle(option.value);
          }}
        />
      ))}
    </div>
  );
}

interface LibraryFiltersProps {
  readonly query: LibraryQuery;
  /** Null while the list is loading; the area chips then show no counts. */
  readonly areaCounts: Readonly<Record<InnovationArea, number>> | null;
  readonly onChange: (next: LibraryQuery) => void;
  /** Lets the screen move focus to the search field after "Wyczyść filtry". */
  readonly searchRef: RefObject<HTMLInputElement | null>;
}

export function LibraryFilters({
  query,
  areaCounts,
  onChange,
  searchRef,
}: LibraryFiltersProps): ReactElement {
  const searchId: string = useId();
  const featuresId: string = useId();

  return (
    <div className={styles['filters']}>
      <div className={styles['searchField']}>
        <label htmlFor={searchId} className={styles['searchLabel']}>
          Szukaj w bibliotece
        </label>
        <input
          ref={searchRef}
          id={searchId}
          type="search"
          className={styles['search']}
          placeholder="Nazwa innowacji lub słowo z opisu"
          value={query.text}
          onChange={(event: ChangeEvent<HTMLInputElement>): void => {
            onChange({ ...query, text: event.target.value });
          }}
        />
      </div>
      <ChipGroup
        title="Obszar"
        options={AREA_OPTIONS}
        selected={query.areas}
        labelFor={(option: Option<InnovationArea>): string =>
          areaCounts === null
            ? option.label
            : `${option.label} · ${String(areaCounts[option.value])}`
        }
        onToggle={(value: InnovationArea): void => {
          onChange({ ...query, areas: toggleValue(query.areas, value) });
        }}
      />
      <div className={styles['row']}>
        <ChipGroup
          title="Typ"
          options={KIND_OPTIONS}
          selected={query.kinds}
          onToggle={(value: InnovationKind): void => {
            onChange({ ...query, kinds: toggleValue(query.kinds, value) });
          }}
        />
        <ChipGroup
          title="Koszt roczny"
          options={COST_OPTIONS}
          selected={query.costs}
          onToggle={(value: CostBand): void => {
            onChange({ ...query, costs: toggleValue(query.costs, value) });
          }}
        />
        <div
          role="group"
          aria-labelledby={featuresId}
          className={styles['group']}
        >
          <span id={featuresId} className={styles['groupTitle']}>
            Cechy
          </span>
          <ChoiceChip
            label="Szuka testerów"
            selected={query.seeksTesters}
            onToggle={(): void => {
              onChange({ ...query, seeksTesters: !query.seeksTesters });
            }}
          />
          <ChoiceChip
            label="Ma film"
            selected={query.hasVideo}
            onToggle={(): void => {
              onChange({ ...query, hasVideo: !query.hasVideo });
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

`ChoiceChip` renders a selected chip as `✓ ` (in an `aria-hidden` span) plus the label, so a chip's accessible name is always its label alone.

Create `src/features/library/LibraryFilters.module.css`:

```css
.filters {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.searchField {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.searchLabel {
  font-size: 1.0625rem;
  font-weight: 600;
}

.search {
  width: 100%;
  max-width: 40rem;
  height: 3.25rem;
  padding: 0 1rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
  font-size: 1.125rem;
}

.search::placeholder {
  color: var(--c-muted);
  opacity: 1;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem 2rem;
}

.group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.groupTitle {
  margin-right: 0.25rem;
  color: var(--c-muted);
  font-size: 0.9375rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

- [ ] **Step 6: Write the screen**

Create `src/features/library/LibraryScreen.tsx`:

```tsx
import { useRef, type ChangeEvent, type ReactElement, type RefObject } from 'react';
import { Link } from 'react-router';

import type { HubApi } from '../../api/HubApi';
import type { InnovationSummary } from '../../api/types';
import { useApi } from '../../app/contexts';
import { useAsync, type AsyncResult } from '../../app/useAsync';
import { Button } from '../../ui/Button';
import { buttonClass } from '../../ui/buttonClass';
import { LoadError } from '../../ui/LoadError';
import { Skeleton } from '../../ui/Skeleton';
import {
  countByArea,
  filterInnovations,
  resultLabel,
  sortInnovations,
} from './filterInnovations';
import { InnovationTile } from './InnovationTile';
import { LibraryFilters } from './LibraryFilters';
import {
  EMPTY_QUERY,
  hasFilters,
  SORT_OPTIONS,
  type LibrarySort,
  type Option,
} from './libraryQuery';
import styles from './LibraryScreen.module.css';
import { useLibraryQuery, type LibraryQueryState } from './useLibraryQuery';

const SKELETON_TILES: readonly number[] = [1, 2, 3, 4, 5, 6];

export function LibraryScreen(): ReactElement {
  const api: HubApi = useApi();
  const { query, setQuery }: LibraryQueryState = useLibraryQuery();
  const searchRef: RefObject<HTMLInputElement | null> =
    useRef<HTMLInputElement | null>(null);
  const { state, retry }: AsyncResult<readonly InnovationSummary[]> = useAsync<
    readonly InnovationSummary[]
  >(
    'library',
    (signal: AbortSignal): Promise<readonly InnovationSummary[]> =>
      api.listInnovations(signal),
  );
  const all: readonly InnovationSummary[] =
    state.status === 'ready' ? state.data : [];
  const shown: readonly InnovationSummary[] = sortInnovations(
    filterInnovations(all, query),
    query.sort,
  );

  function clear(): void {
    setQuery({ ...EMPTY_QUERY, sort: query.sort });
    searchRef.current?.focus();
  }

  return (
    <main className={styles['main']}>
      <div className={styles['header']}>
        <h1 className={styles['title']}>Biblioteka innowacji</h1>
        <p className={styles['lead']}>
          Sprawdzone rozwiązania społeczne z Małopolski. Wyszukaj je po nazwie
          albo zawęź listę filtrami.
        </p>
      </div>
      <LibraryFilters
        query={query}
        areaCounts={state.status === 'ready' ? countByArea(all, query) : null}
        onChange={setQuery}
        searchRef={searchRef}
      />
      {state.status === 'error' ? (
        <LoadError message={state.message} onRetry={retry} />
      ) : null}
      {state.status === 'loading' ? (
        <>
          <p role="status" className={styles['loading']}>
            Wczytujemy bibliotekę…
          </p>
          <div className={styles['grid']}>
            {SKELETON_TILES.map((key: number): ReactElement => (
              <div key={key} className={styles['skeletonTile']}>
                <Skeleton width="45%" height="1rem" />
                <Skeleton width="80%" height="1.75rem" />
                <Skeleton height="3rem" />
                <Skeleton width="60%" height="1.5rem" />
              </div>
            ))}
          </div>
        </>
      ) : null}
      {state.status === 'ready' ? (
        <>
          <div className={styles['bar']}>
            <p aria-live="polite" className={styles['count']}>
              {resultLabel(shown.length, all.length)}
            </p>
            {hasFilters(query) && shown.length > 0 ? (
              <Button variant="link" onClick={clear}>
                Wyczyść filtry
              </Button>
            ) : null}
            <label className={styles['sort']}>
              <span className={styles['sortLabel']}>Sortuj</span>
              <select
                className={styles['select']}
                value={query.sort}
                onChange={(event: ChangeEvent<HTMLSelectElement>): void => {
                  const next: Option<LibrarySort> | undefined =
                    SORT_OPTIONS.find(
                      (option: Option<LibrarySort>): boolean =>
                        option.value === event.target.value,
                    );
                  if (next !== undefined) {
                    setQuery({ ...query, sort: next.value });
                  }
                }}
              >
                {SORT_OPTIONS.map(
                  (option: Option<LibrarySort>): ReactElement => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ),
                )}
              </select>
            </label>
          </div>
          {shown.length === 0 ? (
            <div className={styles['empty']}>
              <h2 className={styles['emptyTitle']}>
                Żadna innowacja nie pasuje do tych filtrów
              </h2>
              <p className={styles['emptyText']}>
                Zmień filtry albo opisz własne rozwiązanie.
              </p>
              <div className={styles['emptyActions']}>
                <Button variant="secondary" onClick={clear}>
                  Wyczyść filtry
                </Button>
                <Link to="/zglos-pomysl" className={buttonClass('link')}>
                  Zgłoś pomysł
                </Link>
              </div>
            </div>
          ) : (
            <ul aria-label="Innowacje" className={styles['grid']}>
              {shown.map(
                (innovation: InnovationSummary): ReactElement => (
                  <InnovationTile key={innovation.id} innovation={innovation} />
                ),
              )}
            </ul>
          )}
        </>
      ) : null}
    </main>
  );
}
```

Create `src/features/library/LibraryScreen.module.css`:

```css
.main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  max-width: 90rem;
  margin-inline: auto;
  padding: 2.25rem 3.5rem 3.5rem;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.lead {
  max-width: 48rem;
  color: var(--c-ink-2);
  font-size: 1.1875rem;
}

.loading {
  color: var(--c-ink-2);
  font-size: 1.0625rem;
  font-weight: 600;
}

.bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--c-line);
}

.count {
  font-size: 1.25rem;
  font-weight: 600;
}

.sort {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
  margin-left: auto;
}

.sortLabel {
  color: var(--c-muted);
  font-size: 1rem;
  font-weight: 600;
}

.select {
  min-height: var(--target);
  padding: 0 0.75rem;
  border: 1px solid var(--c-line-strong);
  border-radius: var(--radius);
  background: var(--c-white);
  font-size: 1.0625rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.skeletonTile {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.375rem 1.5rem;
  border: 1px solid var(--c-line);
  border-radius: var(--radius);
  background: var(--c-white);
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 2rem 1.75rem;
  border: 1px dashed var(--c-line-strong);
  border-radius: var(--radius);
}

.emptyTitle {
  font-size: 1.5rem;
  font-weight: 600;
}

.emptyText {
  color: var(--c-ink-2);
  font-size: 1.125rem;
}

.emptyActions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

@container page (width <= 75rem) {
  .main {
    padding-inline: 2rem;
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
```

- [ ] **Step 7: Wire the route**

In `src/app/routes.tsx`, add the import in alphabetical position among the feature imports:

```tsx
import { LibraryScreen } from '../features/library/LibraryScreen';
```

and add this route in the `PublicLayout` children, directly above `{ path: 'innowacje/:id', element: <InnovationScreen /> }`:

```tsx
          { path: 'biblioteka', element: <LibraryScreen /> },
```

In `src/shell/navigation.ts`, delete this line from `STUB_TITLES`:

```ts
  '/biblioteka': 'Biblioteka innowacji',
```

- [ ] **Step 8: Run the tests**

Run: `npx vitest run src/features/library src/shell` — Expected: PASS.

If "opens a card and comes back" fails on the final `search` assertion with an extra history entry, a `setParams` call is missing `{ replace: true }`.

Run: `npx vitest run` — Expected: PASS, 21 files, all tests.

- [ ] **Step 9: Lint, format, typecheck**

Run: `npm run format && npm run lint && npm run typecheck` — Expected: no errors.

- [ ] **Step 10: Commit**

```bash
git add src
git commit -m "feat: add innovation library screen with search, filters and sorting"
```

---

### Task 6: README and the full check

**Files:**
- Modify: `README.md` (repository root)

**Interfaces:**
- Consumes: the finished feature.
- Produces: nothing for later tasks.

- [ ] **Step 1: Update the README**

In `README.md`, in the section `## Wersja demonstracyjna`, insert this paragraph directly after the paragraph that starts with "Scenariusz w sześciu krokach":

```markdown
Biblioteka innowacji (`/biblioteka`) pokazuje 12 przykładowych innowacji
z wyszukiwaniem, filtrami obszaru, typu i kosztu oraz sortowaniem. Stan filtrów
jest zapisany w adresie strony, więc widok można wysłać linkiem.
```

- [ ] **Step 2: Run the full check from the repository root**

Run: `make check` — Expected: backend lint, types and tests pass; frontend lint, format check, typecheck, tests and production build pass. If `uv` is not found, prefix with `export PATH="$HOME/.local/bin:$PATH" &&`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: describe the innovation library"
```

- [ ] **Step 4: Hand over for the visual check**

No browser automation exists on this machine. Report to the user that `make dev` serves the app at <http://localhost:5173/biblioteka> and ask them to confirm, at 1440px and 1024px window width:

- three tile columns at 1440px, two at 1024px, no horizontal scroll;
- chips wrap cleanly and the "A+" text-size control does not break the grid;
- the whole tile is clickable and shows a focus ring when reached with Tab;
- "Wyczyść filtry" puts the cursor in the search field.
