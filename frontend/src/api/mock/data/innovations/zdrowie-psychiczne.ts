import type { Innovation } from '../../../types';

export const pierwszaRozmowa: Innovation = {
  id: 'pierwsza-rozmowa',
  name: 'Pierwsza Rozmowa',
  area: 'Zdrowie psychiczne',
  kind: 'usługa',
  category: 'Zdrowie psychiczne · usługa',
  summary:
    'Bezpłatna rozmowa z psychologiem w ciągu 72 godzin, bez skierowania i bez kolejki.',
  verified: '03.2026',
  cost: 'ok. 70–110 tys. zł / rok',
  costBand: 'high',
  seeksTesters: false,
  hasVideo: false,
  author: 'Centrum Wsparcia Psychologicznego Pogórze',
  incubator: 'Małopolski Inkubator Usług Społecznych „Pomost”',
  rating: '4,5',
  reviewCount: 10,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Na pierwszą wizytę u psychologa czeka się miesiącami, a w małych gminach często nie ma go wcale.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Dorośli i młodzież w kryzysie emocjonalnym, którzy nie wiedzą, od czego zacząć szukanie pomocy.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'Gminy i powiaty, ośrodki zdrowia, poradnie, organizacje pozarządowe.',
    },
    {
      label: 'Składowe',
      value:
        'Infolinia i formularz zgłoszeniowy, grupa psychologów na dyżurach, krótka rozmowa wstępna, mapa dalszej pomocy.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 70–110 tys. zł rocznie. Trzech psychologów na dyżurach w wymiarze łącznie jednego etatu i koordynator.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz opis procedury, zawrzyj umowy z psychologami i poproś autora o konsultację przy uruchomieniu zapisów.',
    },
  ],
  materials: [
    'Opis procedury zgłoszenia i rozmowy (PDF, 780 KB)',
    'Wzór umowy z psychologiem (DOCX, 82 KB)',
    'Mapa dalszej pomocy dla gminy (PDF, 1,5 MB)',
  ],
  steps: [
    'Zbierz informację, którzy psychologowie z okolicy mogą przyjmować na dyżurach.',
    'Uruchom numer telefonu i prosty formularz zgłoszeniowy na stronie gminy.',
    'Ustal, kto w ciągu doby oddzwania do zgłaszającego i umawia rozmowę.',
    'Po pierwszym kwartale sprawdź czas oczekiwania i liczbę osób skierowanych dalej.',
  ],
  fundingProgrammes: [
    'Powiatowy Program Pomocy Psychologicznej (przykład)',
    'FERS – usługi zdrowotne',
  ],
  fundingNote:
    'Sprawdzono 03.2026. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '5 – bardzo pomogło · urząd gminy, gmina wiejska',
      quote:
        'Pierwsza rozmowa odbywa się w trzy dni, a nie po czterech miesiącach.',
    },
    {
      heading: '4 – pomogło · ośrodek zdrowia, powiat',
      quote:
        'Brakuje psychologów, więc dyżury trzeba układać z dużym wyprzedzeniem.',
    },
  ],
};

export const termometrNastroju: Innovation = {
  id: 'termometr-nastroju',
  name: 'Termometr Nastroju',
  area: 'Zdrowie psychiczne',
  kind: 'narzędzie',
  category: 'Zdrowie psychiczne · narzędzie',
  summary:
    'Anonimowa ankieta w szkole, która co miesiąc pokazuje wychowawcom nastroje w klasach.',
  verified: '10.2025',
  cost: 'ok. 2 tys. zł / rok',
  costBand: 'low',
  seeksTesters: true,
  hasVideo: false,
  author: 'Zespół Szkół w Dolinie Raby',
  incubator: 'Pracownia Wdrożeń Społecznych „Żuraw”',
  rating: '3,9',
  reviewCount: 4,
  testerNote: 'Zostało 5 miejsc dla testerów · do 20.11.2026',
  facts: [
    {
      label: 'Problem',
      value:
        'Nauczyciele zauważają pogorszenie nastroju uczniów dopiero wtedy, gdy dochodzi do poważnego kryzysu.',
    },
    {
      label: 'Grupa docelowa',
      value: 'Uczniowie klas 5–8 szkół podstawowych oraz ich wychowawcy.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'Szkoły, gminne zespoły obsługi szkół, poradnie psychologiczno-pedagogiczne.',
    },
    {
      label: 'Składowe',
      value:
        'Pięć krótkich pytań w formularzu internetowym, zestawienie wyników dla klas, zasady anonimowości, plan reakcji.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 2 tys. zł rocznie. Pedagog szkolny na kilka godzin w miesiącu i wychowawcy klas.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz formularz i zasady anonimowości, omów je z radą pedagogiczną i rodzicami, uruchom ankietę w jednej klasie.',
    },
  ],
  materials: [
    'Formularz ankiety w pięciu pytaniach (PDF, 150 KB)',
    'Zasady anonimowości i plan reakcji (PDF, 320 KB)',
  ],
  steps: [
    'Omów pomysł z dyrektorem szkoły i pedagogiem, a potem z radą rodziców.',
    'Przeprowadzaj ankietę w jednej klasie przez dwa miesiące na próbę.',
    'Spotykaj się z wychowawcami po każdym zestawieniu wyników i ustalaj kolejne kroki.',
    'Dopiero po pierwszym semestrze rozszerz ankietę na kolejne klasy.',
  ],
  fundingProgrammes: ['Szkolny Program Profilaktyki (przykład)'],
  fundingNote:
    'Sprawdzono 10.2025. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '4 – pomogło · szkoła, gmina wiejska',
      quote:
        'Zauważyliśmy spadek nastroju w jednej klasie na dwa tygodnie przed sprawdzianami.',
    },
    {
      heading: '3 – częściowo pomogło · szkoła, gmina miejsko-wiejska',
      quote:
        'Część uczniów wypełnia ankietę byle jak, więc wyniki trzeba czytać ostrożnie.',
    },
  ],
};
