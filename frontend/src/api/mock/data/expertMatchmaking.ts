import { expertiseLabel } from '../../expertProfile';
import type {
  ExpertInnovationMatch,
  ExpertSearchRequest,
  ExpertiseDomain,
  Innovation,
} from '../../types';
import { innovations } from './innovations';

interface ExpertCandidate {
  readonly innovationId: string;
  readonly summary: string;
  readonly keywords: readonly string[];
  readonly relevance: Readonly<Record<ExpertiseDomain, number>>;
  readonly contributions: Readonly<Record<ExpertiseDomain, string>>;
}

const CANDIDATES: readonly ExpertCandidate[] = [
  {
    innovationId: 'telefony-zyczliwosci',
    summary:
      'Regularne rozmowy telefoniczne wolontariuszy z seniorami mieszkającymi samotnie.',
    keywords: [
      'seniorzy',
      'samotność',
      'psychologia',
      'psycholożka',
      'wolontariuszy',
      'wolontariat',
      'rozmowy',
      'telefon',
      'dobrostan',
    ],
    relevance: {
      'senior-support': 30,
      'digital-inclusion': 10,
      community: 20,
      'service-design': 25,
    },
    contributions: {
      'senior-support':
        'Pomóż poprawić scenariusz rozmowy i sposób rozpoznawania potrzeb seniorów.',
      'digital-inclusion':
        'Sprawdź dostępność usługi dla osób korzystających wyłącznie ze zwykłego telefonu.',
      community:
        'Zaproponuj sposób rekrutacji i przygotowania wolontariuszy do regularnego kontaktu.',
      'service-design':
        'Pomóż dopracować proces koordynacji rozmów oraz ocenę efektów pilotażu.',
    },
  },
  {
    innovationId: 'mobilna-kawiarenka',
    summary:
      'Spotkania i zajęcia dla seniorów, organizowane blisko ich domów przez mobilny zespół.',
    keywords: [
      'seniorzy',
      'integracja',
      'społeczność',
      'spotkania',
      'transport',
      'wolontariat',
      'animacja',
      'sąsiedzi',
    ],
    relevance: {
      'senior-support': 20,
      'digital-inclusion': 5,
      community: 30,
      'service-design': 30,
    },
    contributions: {
      'senior-support':
        'Zaproponuj zajęcia wspierające dobrostan i udział seniorów o różnych potrzebach.',
      'digital-inclusion':
        'Pomóż zadbać o dostępne zapisy i informowanie uczestników bez internetu.',
      community:
        'Rozwiń pomysły na spotkania, które łączą mieszkańców i lokalnych wolontariuszy.',
      'service-design':
        'Pomóż zaplanować mobilną usługę, logistykę spotkań i zbieranie opinii uczestników.',
    },
  },
  {
    innovationId: 'cyfrowy-wnuk',
    summary:
      'Indywidualna pomoc młodych wolontariuszy w korzystaniu ze smartfona i internetu.',
    keywords: [
      'seniorzy',
      'cyfrowe',
      'cyfrowa',
      'dostępność',
      'internet',
      'smartfon',
      'technologia',
      'edukacja',
      'bezpieczeństwo',
    ],
    relevance: {
      'senior-support': 10,
      'digital-inclusion': 30,
      community: 15,
      'service-design': 20,
    },
    contributions: {
      'senior-support':
        'Sprawdź, jak dostosować tempo nauki i wsparcie do potrzeb starszych uczestników.',
      'digital-inclusion':
        'Zaproponuj dostępniejsze materiały oraz ćwiczenia z bezpiecznego korzystania z internetu.',
      community:
        'Pomóż rozwinąć współpracę międzypokoleniową i przygotować młodych wolontariuszy.',
      'service-design':
        'Pomóż dopracować dobór par uczestników i sposób mierzenia postępów nauki.',
    },
  },
];

function normalise(text: string): string {
  return text
    .toLocaleLowerCase('pl')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ł/g, 'l');
}

/** A deterministic POC ranking by expertise and profile keywords; no embeddings. */
export function findExpertInnovations(
  request: ExpertSearchRequest,
): readonly ExpertInnovationMatch[] {
  const profileText: string = normalise(
    `${request.profile.profession} ${request.profile.description}`,
  );
  const terms: readonly string[] = normalise(request.query)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const candidates: readonly ExpertCandidate[] = CANDIDATES.filter(
    (candidate: ExpertCandidate): boolean => {
      const text: string = normalise(
        `${innovations[candidate.innovationId]?.name ?? ''} ${candidate.summary} ${candidate.keywords.join(' ')}`,
      );
      return terms.every((term: string): boolean => text.includes(term));
    },
  );
  function score(candidate: ExpertCandidate): number {
    return (
      candidate.relevance[request.profile.domain] +
      candidate.keywords.filter((word: string): boolean =>
        profileText.includes(normalise(word)),
      ).length
    );
  }
  return [...candidates]
    .sort(
      (left: ExpertCandidate, right: ExpertCandidate): number =>
        score(right) - score(left),
    )
    .map((candidate: ExpertCandidate): ExpertInnovationMatch => {
      const innovation: Innovation | undefined =
        innovations[candidate.innovationId];
      if (innovation === undefined) {
        throw new Error('Nie znaleziono innowacji w katalogu demonstracyjnym.');
      }
      return {
        innovationId: innovation.id,
        name: innovation.name,
        category: innovation.category,
        summary: candidate.summary,
        reason: `Twoja dziedzina: ${expertiseLabel(request.profile.domain)}. To obszar, w którym możesz wesprzeć rozwój tego rozwiązania.`,
        contribution: candidate.contributions[request.profile.domain],
      };
    });
}
