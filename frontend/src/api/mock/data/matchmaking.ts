import type {
  LocalStats,
  MatchResults,
  ProblemCard,
  ReasonSegment,
  RedactionResult,
} from '../../types';

export const exampleRedaction: RedactionResult = {
  segments: [
    {
      kind: 'text',
      text: 'W naszej gminie wielu starszych ludzi mieszka samotnie, dzieci wyjechały do pracy za granicę. ',
    },
    { kind: 'replacement', replacementId: 'osoba-a' },
    { kind: 'text', text: ' z ' },
    { kind: 'replacement', replacementId: 'miejscowosc' },
    { kind: 'text', text: ' (tel. ' },
    { kind: 'replacement', replacementId: 'telefon' },
    { kind: 'text', text: ') ' },
    { kind: 'replacement', replacementId: 'zdrowie' },
    { kind: 'text', text: ' prawie nie wychodzi z domu, a ' },
    { kind: 'replacement', replacementId: 'osoba-b' },
    {
      kind: 'text',
      text: ' jest w Niemczech. Nie ma transportu do miasta i poza listonoszem nikt ich nie odwiedza.',
    },
  ],
  replacements: [
    {
      id: 'osoba-a',
      icon: '●',
      tag: 'OSOBA_A',
      inlineLabel: 'OSOBA_A',
      kind: 'Imię osoby',
      original: 'Pani Janina',
      restorable: true,
    },
    {
      id: 'miejscowosc',
      icon: '◆',
      tag: 'MIEJSCOWOŚĆ',
      inlineLabel: 'MIEJSCOWOŚĆ',
      kind: 'Nazwa wsi',
      original: 'Jodłowej Woli',
      restorable: true,
    },
    {
      id: 'telefon',
      icon: '☎',
      tag: 'TELEFON',
      inlineLabel: 'TELEFON',
      kind: 'Numer telefonu',
      original: '600 123 456',
      restorable: true,
    },
    {
      id: 'zdrowie',
      icon: '✚',
      tag: 'ZDROWIE',
      inlineLabel: 'INFORMACJA O ZDROWIU USUNIĘTA',
      kind: 'Informacja o chorobie',
      original: 'od zawału',
      restorable: false,
    },
    {
      id: 'osoba-b',
      icon: '●',
      tag: 'OSOBA_B',
      inlineLabel: 'OSOBA_B',
      kind: 'Imię członka rodziny',
      original: 'jej syn Marek',
      restorable: true,
    },
  ],
};

export const exampleProblemCard: ProblemCard = {
  summary:
    'w Twojej wiejskiej gminie starsze osoby mieszkają same, bo rodziny wyjechały. Brakuje im kontaktu z innymi ludźmi i dojazdu do miasta. Szukasz rozwiązania, które może wdrożyć gmina albo GOPS.',
  groups: [
    { id: 'grupa', label: 'Grupa docelowa', chips: ['seniorzy 65+'] },
    {
      id: 'problem',
      label: 'Problem',
      chips: ['samotność', 'brak transportu'],
    },
    { id: 'gmina', label: 'Typ gminy', chips: ['wiejska'] },
    { id: 'wdraza', label: 'Kto wdraża', chips: ['GOPS'] },
  ],
  questions: [
    {
      id: 'kto',
      title: 'Kto miałby wdrażać?',
      options: ['GOPS / OPS', 'NGO', 'Gmina z NGO', 'Nie wiem'],
      suggested: 'Gmina z NGO',
    },
    {
      id: 'pilne',
      title: 'Co jest najpilniejsze?',
      options: ['Kontakt z ludźmi', 'Dojazdy', 'Pomoc w domu'],
      suggested: 'Kontakt z ludźmi',
    },
    {
      id: 'budzet',
      title: 'Skala budżetu?',
      options: ['do 10 tys. zł', '10–50 tys. zł', 'ponad 50 tys. zł'],
      suggested: null,
    },
  ],
};

export const exampleMatches: MatchResults = {
  searchTerms: [
    'seniorzy 65+',
    'samotność',
    'brak transportu',
    'gmina wiejska',
  ],
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
    {
      quote:
        'Starsze osoby we wsiach bez komunikacji publicznej tygodniami nie rozmawiają z nikim poza rodziną przez telefon.',
      innovationId: 'telefony-zyczliwosci',
      source: 'Sąsiedzkie Telefony Życzliwości',
    },
    {
      quote:
        'Dzieci seniorów pracują za granicą, a sąsiedzka pomoc zanikła razem z wiejskim sklepem.',
      innovationId: 'mobilna-kawiarenka',
      source: 'Mobilna Kawiarenka Seniora',
    },
    {
      quote:
        'Seniorzy chcą kontaktu z wnukami, ale nie umieją obsługiwać komunikatorów.',
      innovationId: 'cyfrowy-wnuk',
      source: 'Cyfrowy Wnuk',
    },
  ],
};

/** `*like this*` marks a highlighted fragment, as in the mockup script. */
function segments(text: string): readonly ReasonSegment[] {
  return text
    .split('*')
    .map((part: string, index: number): ReasonSegment => ({
      text: part,
      highlight: index % 2 === 1,
    }))
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
