import type {
  ChipGroup,
  FitTag,
  MatchCard,
  MatchRequest,
  MatchResults,
  ProblemCard,
  ProblemInput,
  ReasonSegment,
} from '../../types';
import { exampleMatches } from './matchmaking';

/** One POC scenario: an older person looking for regular social contact. */
export function summariseIndividualProblem(input: ProblemInput): ProblemCard {
  return {
    audience: 'individual',
    summary: `szukasz wsparcia dla siebie. Tak opisujesz swoją sytuację: „${input.description}”`,
    groups: [
      { id: 'grupa', label: 'Kogo dotyczy potrzeba', chips: ['mnie'] },
      {
        id: 'problem',
        label: 'Obszar wsparcia w POC',
        chips: ['kontakt z ludźmi', 'samotność'],
      },
    ],
    questions: [
      {
        id: 'priority',
        title: 'Co najbardziej by Ci pomogło?',
        options: ['Regularna rozmowa', 'Spotkania w okolicy', 'Kontakt online'],
        suggested: 'Regularna rozmowa',
      },
      {
        id: 'access',
        title: 'Jak chcesz korzystać ze wsparcia?',
        options: ['Telefonicznie', 'Na miejscu', 'Przez internet'],
        suggested: 'Telefonicznie',
      },
    ],
  };
}

function preferredInnovation(request: MatchRequest): string {
  if (request.answers['priority'] === 'Spotkania w okolicy') {
    return 'mobilna-kawiarenka';
  }
  if (
    request.answers['priority'] === 'Kontakt online' ||
    request.answers['access'] === 'Przez internet'
  ) {
    return 'cyfrowy-wnuk';
  }
  return 'telefony-zyczliwosci';
}

const PERSONAL_FIT: Readonly<Record<string, readonly string[]>> = {
  'telefony-zyczliwosci': [
    'regularna rozmowa',
    'zwykły telefon',
    'bez dojazdów',
  ],
  'mobilna-kawiarenka': ['kontakt z ludźmi', 'spotkania w okolicy'],
  'cyfrowy-wnuk': ['kontakt z rodziną', 'pomoc w obsłudze internetu'],
};

export function findIndividualMatches(request: MatchRequest): MatchResults {
  const preferred: string = preferredInnovation(request);
  const cards: MatchCard[] = exampleMatches.cards.map(
    (card: MatchCard): MatchCard => ({
      ...card,
      band: card.innovationId === preferred ? 'strong' : 'medium',
      cost: 'do ustalenia z organizatorem',
      fit: (PERSONAL_FIT[card.innovationId] ?? []).map(
        (label: string): FitTag => ({ label, ok: true }),
      ),
    }),
  );
  cards.sort(
    (left: MatchCard, right: MatchCard): number =>
      Number(right.innovationId === preferred) -
      Number(left.innovationId === preferred),
  );
  return {
    ...exampleMatches,
    cards,
    searchTerms: request.card.groups.flatMap(
      (group: ChipGroup): readonly string[] => group.chips,
    ),
  };
}

export const individualReasons: Readonly<
  Record<string, readonly ReasonSegment[]>
> = {
  'telefony-zyczliwosci': [
    { text: 'Regularne rozmowy z wolontariuszem', highlight: true },
    {
      text: ' mogą dać Ci codzienny kontakt z drugą osobą. Wystarczy ',
      highlight: false,
    },
    { text: 'zwykły telefon', highlight: true },
    {
      text: ', a udział nie wymaga dojazdów ani korzystania ze smartfona.',
      highlight: false,
    },
  ],
  'mobilna-kawiarenka': [
    { text: 'Spotkania w Twojej okolicy', highlight: true },
    {
      text: ' mogą pomóc Ci poznać sąsiadów i spędzać czas z innymi. Zapytaj Hub, czy taką usługę można uruchomić w Twojej gminie.',
      highlight: false,
    },
  ],
  'cyfrowy-wnuk': [
    { text: 'Pomoc w nauce rozmów przez internet', highlight: true },
    {
      text: ' może ułatwić kontakt z bliskimi mieszkającymi daleko. Potrzebny jest dostęp do internetu i odpowiednie urządzenie.',
      highlight: false,
    },
  ],
};
