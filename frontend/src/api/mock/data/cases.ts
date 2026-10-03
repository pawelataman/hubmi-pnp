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
    seedCase(
      '0141',
      'Potrzeba',
      'Samotni seniorzy bez dojazdu do miasta',
      'Seniorzy',
      'Jodłowa Wola',
      '03.10',
      'Nowe',
      null,
      true,
      'ewa',
    ),
    seedCase(
      '0140',
      'Potrzeba',
      'Brak wsparcia dla opiekunów osób zależnych',
      'Opiekunowie',
      'pow. limanowski',
      '02.10',
      'Nowe',
      null,
      true,
      null,
    ),
    seedCase(
      '0139',
      'Zapytanie',
      'Koszty startu: Mobilna Kawiarenka Seniora',
      'Seniorzy',
      'pow. gorlicki',
      '01.10',
      'W trakcie',
      'dr P. Nowak',
      false,
      null,
    ),
    seedCase(
      '0138',
      'Do testów',
      'Cyfrowy Wnuk — zgłoszenie testera',
      'Wykluczenie cyfrowe',
      'pow. nowotarski',
      '30.09',
      'Odpowiedziano',
      'M. Wójcik',
      false,
      'maria',
    ),
    seedCase(
      '0137',
      'Opinia',
      'Telefony Życzliwości — „4 – pomogło”',
      'Seniorzy',
      'Kraków',
      '29.09',
      'Odpowiedziano',
      null,
      false,
      null,
    ),
    seedCase(
      '0136',
      'Potrzeba',
      'Młodzież nie ma miejsca spotkań po szkole',
      'Młodzież',
      'pow. olkuski',
      '27.09',
      'Ponad 48 h',
      null,
      false,
      null,
    ),
    seedCase(
      '0135',
      'Pomysł',
      'Wiejska biblioteka rzeczy',
      'Społeczność lokalna',
      'pow. miechowski',
      '26.09',
      'Ponad 48 h',
      'K. Zając',
      false,
      null,
    ),
    seedCase(
      '0134',
      'Potrzeba',
      'Kryzys psychiczny u nastolatków, długie kolejki',
      'Zdrowie psychiczne',
      'pow. oświęcimski',
      '25.09',
      'W trakcie',
      'dr A. Lis',
      true,
      null,
    ),
  ];
}

export function seedNotifications(): Map<PersonaId, Notification[]> {
  return new Map<PersonaId, Notification[]>([
    [
      'maria',
      [
        {
          id: 'n1',
          icon: '↩',
          text: 'ROPS odpowiedział na Twój pomysł »Sąsiedzka kawiarenka«',
          type: 'Odpowiedź',
          time: '2 min temu',
          unread: true,
          caseId: 'HUB-2026-0142',
        },
        {
          id: 'n2',
          icon: '◎',
          text: 'Twoje zgłoszenie do testów »Cyfrowy Wnuk« zostało przyjęte',
          type: 'Testy',
          time: '1 godz. temu',
          unread: true,
          caseId: 'HUB-2026-0138',
        },
        {
          id: 'n3',
          icon: '◷',
          text: 'Nowy nabór w obszarze „Seniorzy”: Usługa Wrażliwa, do 30.11',
          type: 'Nabór',
          time: 'wczoraj',
          unread: true,
          caseId: null,
        },
        {
          id: 'n4',
          icon: '★',
          text: 'Autor innowacji podziękował za Twoją opinię',
          type: 'Opinia',
          time: '3 dni temu',
          unread: false,
          caseId: null,
        },
      ],
    ],
    [
      'ewa',
      [
        {
          id: 'n5',
          icon: '◷',
          text: 'Nowy nabór w obszarze „Seniorzy”: Usługa Wrażliwa, do 30.11',
          type: 'Nabór',
          time: 'wczoraj',
          unread: true,
          caseId: null,
        },
      ],
    ],
    ['anna', []],
  ]);
}
