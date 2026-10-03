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
  {
    id: 'zakres',
    heading: 'Zakres usługi',
    kind: 'text',
    text: 'Codzienne, 10–15-minutowe rozmowy telefoniczne wolontariuszy z samotnymi seniorami oraz spotkanie w świetlicy raz w miesiącu.',
  },
  {
    id: 'odbiorcy',
    heading: 'Odbiorcy',
    kind: 'text',
    text: 'Około 40 osób 65+ mieszkających samotnie w 11 sołectwach, wskazanych przez GOPS i sołtysów.',
  },
  {
    id: 'kadra',
    heading: 'Kadra',
    kind: 'text',
    text: 'Koordynator z GOPS (1/4 etatu), 8 wolontariuszy z KGW, OSP i szkoły średniej; superwizja raz w miesiącu.',
  },
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
  {
    id: 'ryzyka',
    heading: 'Ryzyka',
    kind: 'text',
    text: 'Zbyt mało wolontariuszy w małych sołectwach · rezygnacja seniorów po 1–2 rozmowach · brak procedury, gdy senior nie odbiera.',
  },
];
