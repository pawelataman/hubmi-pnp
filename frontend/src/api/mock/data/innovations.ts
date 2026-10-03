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
    hasVideo: false,
    facts: [
      {
        label: 'Problem',
        value:
          'Samotność seniorów i trudny dojazd do miejsc spotkań w małych miejscowościach.',
      },
      {
        label: 'Grupa docelowa',
        value: 'Seniorzy, którzy chcą spotykać się z innymi blisko domu.',
      },
      {
        label: 'Kto może skorzystać',
        value: 'Gminy, organizacje pozarządowe i lokalne kluby seniora.',
      },
      {
        label: 'Składowe',
        value:
          'Mobilny zespół, harmonogram wizyt, dostępne miejsce spotkań, animator i lokalni wolontariusze.',
      },
      {
        label: 'Koszt i kadra',
        value:
          'Przykładowo 40–60 tys. zł rocznie. Koordynator, animator i zespół wolontariuszy.',
      },
      {
        label: 'Jak skorzystać',
        value:
          'Ustal lokalne potrzeby, wybierz miejsca spotkań i przygotuj pilotaż z organizatorem.',
      },
    ],
    materials: [
      'Przykładowy program spotkania (PDF)',
      'Lista potrzeb organizacyjnych (DOCX)',
    ],
    steps: [
      'Zapytaj seniorów o preferowane miejsca i zajęcia.',
      'Ustal trasę mobilnego zespołu i dostępne miejsca spotkań.',
      'Przygotuj animatorów i lokalnych wolontariuszy.',
      'Przeprowadź pilotaż i zbierz opinie uczestników.',
    ],
  },
  'cyfrowy-wnuk': {
    ...telefony,
    id: 'cyfrowy-wnuk',
    name: 'Cyfrowy Wnuk',
    category: 'Seniorzy · metoda',
    verified: '11.2025',
    cost: 'ok. 5 tys. zł / edycja',
    seeksTesters: false,
    hasVideo: false,
    facts: [
      {
        label: 'Problem',
        value:
          'Trudności seniorów w korzystaniu ze smartfona i internetu oraz obawa przed zagrożeniami cyfrowymi.',
      },
      {
        label: 'Grupa docelowa',
        value:
          'Seniorzy, którzy chcą rozwijać samodzielność cyfrową przy wsparciu wolontariusza.',
      },
      {
        label: 'Kto może skorzystać',
        value: 'Biblioteki, szkoły, organizacje pozarządowe i kluby seniora.',
      },
      {
        label: 'Składowe',
        value:
          'Pary senior–wolontariusz, indywidualne spotkania, proste ćwiczenia i materiały o bezpieczeństwie w internecie.',
      },
      {
        label: 'Koszt i kadra',
        value:
          'Przykładowo 5 tys. zł na edycję. Koordynator i młodzi wolontariusze.',
      },
      {
        label: 'Jak skorzystać',
        value:
          'Zgłoś chęć udziału do organizatora i ustal, jakich umiejętności chcesz się nauczyć.',
      },
    ],
    materials: [
      'Przykładowe ćwiczenia cyfrowe (PDF)',
      'Zasady bezpieczeństwa dla uczestników (PDF)',
    ],
    steps: [
      'Zbierz potrzeby cyfrowe uczestników.',
      'Przygotuj młodych wolontariuszy do indywidualnej pracy.',
      'Dobierz pary i ustal regularne terminy spotkań.',
      'Sprawdź postępy i popraw materiały na podstawie opinii seniorów.',
    ],
  },
};
