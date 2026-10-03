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
  [
    'telefony-zyczliwosci',
    'Sąsiedzkie Telefony Życzliwości',
    'Seniorzy',
    'usługa',
    '05.2026',
    'ok. 8–15 tys. zł / rok',
    'mid',
    '4,6',
    12,
    true,
    true,
  ],
  [
    'mobilna-kawiarenka',
    'Mobilna Kawiarenka Seniora',
    'Seniorzy',
    'usługa',
    '02.2026',
    'ok. 40–60 tys. zł / rok',
    'high',
    '4,3',
    7,
    false,
    true,
  ],
  [
    'cyfrowy-wnuk',
    'Cyfrowy Wnuk',
    'Seniorzy',
    'metoda',
    '11.2025',
    'ok. 5 tys. zł / edycja',
    'low',
    '4,4',
    9,
    false,
    false,
  ],
  [
    'asystent-na-godziny',
    'Asystent na Godziny',
    'Niepełnosprawność',
    'usługa',
    '04.2026',
    'ok. 60–90 tys. zł / rok',
    'high',
    '4,7',
    15,
    false,
    true,
  ],
  [
    'mapa-barier',
    'Mapa Barier',
    'Niepełnosprawność',
    'narzędzie',
    '01.2026',
    'ok. 3 tys. zł / rok',
    'low',
    '4,1',
    6,
    true,
    false,
  ],
  [
    'praca-na-probe',
    'Praca na Próbę',
    'Niepełnosprawność',
    'metoda',
    '09.2025',
    'ok. 20–35 tys. zł / rok',
    'mid',
    '4,5',
    8,
    false,
    false,
  ],
  [
    'wytchnieniowa-sobota',
    'Wytchnieniowa Sobota',
    'Rodzina i opiekunowie',
    'usługa',
    '06.2026',
    'ok. 25–40 tys. zł / rok',
    'mid',
    '4,8',
    11,
    true,
    true,
  ],
  [
    'krag-opiekunow',
    'Krąg Opiekunów',
    'Rodzina i opiekunowie',
    'metoda',
    '12.2025',
    'ok. 6 tys. zł / rok',
    'low',
    '4,2',
    5,
    false,
    false,
  ],
  [
    'pierwsza-rozmowa',
    'Pierwsza Rozmowa',
    'Zdrowie psychiczne',
    'usługa',
    '03.2026',
    'ok. 70–110 tys. zł / rok',
    'high',
    '4,5',
    10,
    false,
    false,
  ],
  [
    'termometr-nastroju',
    'Termometr Nastroju',
    'Zdrowie psychiczne',
    'narzędzie',
    '10.2025',
    'ok. 2 tys. zł / rok',
    'low',
    '3,9',
    4,
    true,
    false,
  ],
  [
    'sasiedzka-wypozyczalnia',
    'Sąsiedzka Wypożyczalnia Rzeczy',
    'Społeczność lokalna',
    'narzędzie',
    '08.2025',
    'ok. 10–18 tys. zł / rok',
    'mid',
    '4,0',
    6,
    false,
    true,
  ],
  [
    'lawka-dialogu',
    'Ławka Dialogu',
    'Społeczność lokalna',
    'metoda',
    '07.2025',
    'ok. 4 tys. zł / rok',
    'low',
    '4,3',
    3,
    false,
    false,
  ],
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
    const rows: readonly Row[] = all.map((item: Innovation): Row => [
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
    ]);
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
