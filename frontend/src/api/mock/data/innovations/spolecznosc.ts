import type { Innovation } from '../../../types';

export const sasiedzkaWypozyczalnia: Innovation = {
  id: 'sasiedzka-wypozyczalnia',
  name: 'Sąsiedzka Wypożyczalnia Rzeczy',
  area: 'Społeczność lokalna',
  kind: 'narzędzie',
  category: 'Społeczność lokalna · narzędzie',
  summary:
    'Punkt w remizie lub bibliotece, gdzie mieszkańcy wypożyczają narzędzia, sprzęt i wózki.',
  verified: '08.2025',
  cost: 'ok. 10–18 tys. zł / rok',
  costBand: 'mid',
  seeksTesters: false,
  hasVideo: true,
  author: 'Koło Gospodyń Wiejskich Przy Dworze',
  incubator: 'Inkubator Innowacji Społecznych „Most”',
  rating: '4,0',
  reviewCount: 6,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Rzadko używane rzeczy, takie jak drabina, wiertarka czy wózek inwalidzki, trzeba kupować, choć wystarczyłoby je pożyczyć.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Mieszkańcy wsi o niskich dochodach, seniorzy, rodziny z małymi dziećmi i osoby po chorobie.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'Gminne biblioteki, ochotnicze straże pożarne, koła gospodyń, stowarzyszenia.',
    },
    {
      label: 'Składowe',
      value:
        'Katalog rzeczy, regał lub szafa w świetlicy, zeszyt lub prosty system wypożyczeń, regulamin, opiekun punktu.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 10–18 tys. zł rocznie. Opiekun punktu na kilka godzin tygodniowo i wolontariusze od napraw.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz regulamin i listę zakupów na start, wybierz miejsce w remizie lub bibliotece, zbierz od mieszkańców darowizny.',
    },
  ],
  materials: [
    'Regulamin wypożyczalni (PDF, 230 KB)',
    'Lista zakupów na start (XLSX, 38 KB)',
    'Karta wypożyczenia (DOCX, 45 KB)',
  ],
  steps: [
    'Zapytaj mieszkańców na zebraniu wiejskim, jakich rzeczy najczęściej im brakuje.',
    'Wybierz lokal z suchym pomieszczeniem, na przykład w remizie albo bibliotece.',
    'Kup podstawowy zestaw i przyjmij darowizny, oznaczając każdy przedmiot numerem.',
    'Ustal dyżury opiekuna i zasady zwrotu, a po pół roku sprawdź, co wypożycza się najchętniej.',
  ],
  fundingProgrammes: ['Fundusz Sołecki', 'Program Aktywna Wieś (przykład)'],
  fundingNote:
    'Sprawdzono 08.2025. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '4 – pomogło · gmina wiejska, urząd gminy',
      quote: 'Najczęściej pożyczana jest drabina, zaraz po niej kosiarka.',
    },
    {
      heading: '4 – pomogło · biblioteka, gmina miejsko-wiejska',
      quote:
        'Kilka rzeczy nie wróciło, więc trzeba od początku prowadzić zeszyt.',
    },
  ],
};

export const lawkaDialogu: Innovation = {
  id: 'lawka-dialogu',
  name: 'Ławka Dialogu',
  area: 'Społeczność lokalna',
  kind: 'metoda',
  category: 'Społeczność lokalna · metoda',
  summary:
    'Cykl moderowanych rozmów sąsiadów na ławce przed sklepem o sprawach wsi.',
  verified: '07.2025',
  cost: 'ok. 4 tys. zł / rok',
  costBand: 'low',
  seeksTesters: false,
  hasVideo: false,
  author: 'Stowarzyszenie Rozmowy na Rynku',
  incubator: 'Pracownia Wdrożeń Społecznych „Żuraw”',
  rating: '4,3',
  reviewCount: 3,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Mieszkańcy nie rozmawiają o wspólnych sprawach wsi, a konflikty o drogi i hałas narastają, bo nikt ich nie nazywa.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Mieszkańcy wsi w każdym wieku, zwłaszcza nowi osadnicy i długoletni sąsiedzi.',
    },
    {
      label: 'Kto może skorzystać',
      value: 'Sołectwa, urzędy gmin, domy kultury, stowarzyszenia lokalne.',
    },
    {
      label: 'Składowe',
      value:
        'Ławka w widocznym miejscu, cykl czterech rozmów w sezonie, moderator, zasady rozmowy, krótkie podsumowanie dla sołtysa.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 4 tys. zł rocznie. Moderator na kilkanaście godzin w sezonie i przedstawiciel sołectwa.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz zasady rozmowy, wybierz moderatora spoza sporów wsi, ustal z sołtysem dni i temat pierwszego spotkania.',
    },
  ],
  materials: [
    'Zasady moderowanej rozmowy (PDF, 340 KB)',
    'Wzór podsumowania dla sołtysa (DOCX, 52 KB)',
  ],
  steps: [
    'Wybierz z sołtysem ławkę, która stoi tam, gdzie mieszkańcy i tak się zatrzymują.',
    'Znajdź moderatora, który nie jest stroną w lokalnych sporach, i poproś go o prowadzenie.',
    'Ogłoś temat pierwszej rozmowy na tablicy ogłoszeń i w parafii z tygodniowym wyprzedzeniem.',
    'Po każdym spotkaniu spisz ustalenia i przekaż je sołtysowi oraz wójtowi.',
  ],
  fundingProgrammes: ['Budżet Obywatelski Gminy (przykład)'],
  fundingNote:
    'Sprawdzono 07.2025. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '5 – bardzo pomogło · sołectwo, gmina wiejska',
      quote:
        'Po trzech rozmowach wspólnie załatwiliśmy remont drogi do kapliczki.',
    },
    {
      heading: '4 – pomogło · dom kultury, gmina miejsko-wiejska',
      quote: 'Bez dobrego moderatora rozmowa szybko zmienia się w kłótnię.',
    },
  ],
};
