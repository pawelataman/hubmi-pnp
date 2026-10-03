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

export const mobilnaKawiarenka: Innovation = {
  id: 'mobilna-kawiarenka',
  name: 'Mobilna Kawiarenka Seniora',
  area: 'Seniorzy',
  kind: 'usługa',
  category: 'Seniorzy · usługa',
  summary:
    'Bus z kawą i animatorem objeżdża sołectwa, w których nie ma świetlicy ani klubu seniora.',
  verified: '02.2026',
  cost: 'ok. 40–60 tys. zł / rok',
  costBand: 'high',
  seeksTesters: false,
  hasVideo: true,
  author: 'Fundacja Wiejski Stół',
  incubator: 'Pracownia Wdrożeń Społecznych „Żuraw”',
  rating: '4,3',
  reviewCount: 7,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'W rozproszonych sołectwach nie ma miejsca, w którym seniorzy mogliby się spotkać, a dojazd do miasta jest dla nich zbyt trudny.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Seniorzy 60+ z sołectw bez świetlicy, klubu seniora i komunikacji.',
    },
    {
      label: 'Kto może skorzystać',
      value: 'Gminy wiejskie, GOPS, centra usług społecznych, stowarzyszenia.',
    },
    {
      label: 'Składowe',
      value:
        'Wyposażony bus, ekspres i zapas kawy, animator, trasa z harmonogramem, stałe punkty postoju.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 40–60 tys. zł rocznie. Kierowca-animator na pół etatu i 2–3 wolontariuszy.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz opis trasy i zestaw wyposażenia, ustal punkty postoju z sołtysami, zapytaj autora o wizytę studyjną.',
    },
  ],
  materials: [
    'Opis wyposażenia busa (PDF, 1,4 MB)',
    'Wzór harmonogramu trasy (XLSX, 45 KB)',
    'Scenariusze spotkań przy kawie (PDF, 900 KB)',
  ],
  steps: [
    'Sprawdź z sołtysami, w których wsiach seniorzy nie mają gdzie się spotkać.',
    'Wybierz pojazd i ustal, kto będzie nim jeździł oraz prowadził spotkania.',
    'Zaplanuj trasę tak, aby każda wieś miała postój raz na dwa tygodnie.',
    'Po trzech miesiącach przejrzyj frekwencję i zmień przystanki, które świecą pustkami.',
  ],
  fundingProgrammes: [
    'FERS – usługi społeczne',
    'Program Wsparcia Wsi Małopolskiej (przykład)',
  ],
  fundingNote:
    'Sprawdzono 02.2026. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '4 – pomogło · gmina wiejska, urząd gminy',
      quote:
        'Na pierwszy postój przyszło osiem osób, po dwóch miesiącach już dwadzieścia.',
    },
    {
      heading: '4 – pomogło · GOPS, gmina górska',
      quote: 'Bus świetnie działa latem, zimą trzeba skracać trasę.',
    },
  ],
};

export const cyfrowyWnuk: Innovation = {
  id: 'cyfrowy-wnuk',
  name: 'Cyfrowy Wnuk',
  area: 'Seniorzy',
  kind: 'metoda',
  category: 'Seniorzy · metoda',
  summary:
    'Uczniowie w parach z seniorami uczą obsługi telefonu, e-recepty i bankowości.',
  verified: '11.2025',
  cost: 'ok. 5 tys. zł / edycja',
  costBand: 'low',
  seeksTesters: false,
  hasVideo: false,
  author: 'Szkoła Podstawowa nr 2 w Zagórzu Górnym',
  incubator: 'Inkubator Innowacji Społecznych „Most”',
  rating: '4,4',
  reviewCount: 9,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Seniorzy nie radzą sobie z e-receptą, bankowością i wiadomościami od urzędu, więc rezygnują z usług, które są teraz tylko w sieci.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Seniorzy 65+ z podstawową znajomością telefonu oraz uczniowie klas 6–8.',
    },
    {
      label: 'Kto może skorzystać',
      value: 'Szkoły, biblioteki, gminne centra kultury, kluby seniora.',
    },
    {
      label: 'Składowe',
      value:
        'Pary uczeń–senior, cykl sześciu spotkań, karty ćwiczeń, certyfikat dla uczniów, opiekun z ramienia szkoły.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 5 tys. zł za edycję. Nauczyciel-opiekun na kilka godzin tygodniowo i wsparcie bibliotekarza.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz karty ćwiczeń, porozmawiaj z dyrekcją szkoły i zaproś do współpracy klub seniora.',
    },
  ],
  materials: [
    'Karty ćwiczeń dla par (PDF, 3,2 MB)',
    'Poradnik dla nauczyciela-opiekuna (PDF, 1,1 MB)',
  ],
  steps: [
    'Umów się z dyrektorem szkoły i bibliotekarzem na wspólny termin spotkań.',
    'Zbierz zgłoszenia seniorów przez klub seniora, parafię i sołtysów.',
    'Połącz uczniów i seniorów w pary i rozdaj karty ćwiczeń.',
    'Po szóstym spotkaniu zrób małą uroczystość i zapytaj seniorów, czego jeszcze chcą się nauczyć.',
  ],
  fundingProgrammes: ['Fundusz Małych Inicjatyw Lokalnych (przykład)'],
  fundingNote:
    'Sprawdzono 11.2025. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '5 – bardzo pomogło · biblioteka gminna, gmina wiejska',
      quote: 'Seniorzy po raz pierwszy sami odebrali e-receptę z apteki.',
    },
    {
      heading: '4 – pomogło · szkoła, gmina miejsko-wiejska',
      quote: 'Dzieci uczą się cierpliwości, a babcie przestają się bać ekranu.',
    },
  ],
};
