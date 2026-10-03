import type { Innovation } from '../../../types';

export const asystentNaGodziny: Innovation = {
  id: 'asystent-na-godziny',
  name: 'Asystent na Godziny',
  area: 'Niepełnosprawność',
  kind: 'usługa',
  category: 'Niepełnosprawność · usługa',
  summary:
    'Asystent osobisty zamawiany na pojedyncze godziny: do lekarza, urzędu albo na zakupy.',
  verified: '04.2026',
  cost: 'ok. 60–90 tys. zł / rok',
  costBand: 'high',
  seeksTesters: false,
  hasVideo: true,
  author: 'Stowarzyszenie Razem Dalej',
  incubator: 'Małopolski Inkubator Usług Społecznych „Pomost”',
  rating: '4,7',
  reviewCount: 15,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Osoby z niepełnosprawnością potrzebują wsparcia tylko przy wybranych czynnościach, a pełnoetatowa asystencja jest dla gminy za droga i często niedopasowana.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Dorośli z niepełnosprawnością ruchową lub sensoryczną, którzy mieszkają samodzielnie lub z rodziną.',
    },
    {
      label: 'Kto może skorzystać',
      value: 'GOPS, powiatowe centra pomocy rodzinie, organizacje pozarządowe.',
    },
    {
      label: 'Składowe',
      value:
        'Pula godzin na mieszkańca, lista przeszkolonych asystentów, prosty system zamawiania telefonem, zasady rozliczania.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 60–90 tys. zł rocznie. Koordynator na pół etatu i 8–12 asystentów na umowach zlecenia.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz regulamin i wzór umowy, ustal pulę godzin w budżecie GOPS, zapytaj autora o szkolenie asystentów.',
    },
  ],
  materials: [
    'Regulamin usługi (PDF, 480 KB)',
    'Wzór umowy zlecenia asystenta (DOCX, 95 KB)',
    'Program szkolenia asystentów (PDF, 1,3 MB)',
  ],
  steps: [
    'Zbadaj w GOPS, ilu mieszkańców potrzebuje pomocy tylko kilka godzin w miesiącu.',
    'Ustal roczną pulę godzin i zasadę, kto o jej podziale decyduje.',
    'Zrekrutuj i przeszkol asystentów, korzystając z programu autora.',
    'Uruchom zamawianie telefoniczne i co kwartał sprawdzaj, czy pula godzin wystarcza.',
  ],
  fundingProgrammes: [
    'Gminny Program Asystencji Osobistej (przykład)',
    'FERS – usługi społeczne',
  ],
  fundingNote:
    'Sprawdzono 04.2026. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '5 – bardzo pomogło · GOPS, gmina wiejska',
      quote: 'Pierwszy raz mieszkańcy mogą zamówić pomoc na dwie godziny.',
    },
    {
      heading: '5 – bardzo pomogło · powiatowe centrum pomocy rodzinie, powiat',
      quote:
        'Koszt jest wysoki, ale i tak niższy niż całodobowa opieka w domu pomocy.',
    },
  ],
};

export const mapaBarier: Innovation = {
  id: 'mapa-barier',
  name: 'Mapa Barier',
  area: 'Niepełnosprawność',
  kind: 'narzędzie',
  category: 'Niepełnosprawność · narzędzie',
  summary:
    'Mieszkańcy zaznaczają na wspólnej mapie progi, schody i brak podjazdów, a gmina planuje naprawy.',
  verified: '01.2026',
  cost: 'ok. 3 tys. zł / rok',
  costBand: 'low',
  seeksTesters: true,
  hasVideo: false,
  author: 'Fundacja Bez Progów',
  incubator: 'Pracownia Wdrożeń Społecznych „Żuraw”',
  rating: '4,1',
  reviewCount: 6,
  testerNote: 'Zostało 4 miejsca dla testerów · do 31.10.2026',
  facts: [
    {
      label: 'Problem',
      value:
        'Gmina nie wie, które budynki, chodniki i przystanki są niedostępne, więc remonty robi się na oślep.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Osoby poruszające się na wózkach i o kulach, rodzice z wózkami, seniorzy z trudnościami w chodzeniu.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'Urzędy gmin, wydziały infrastruktury, rady osób z niepełnosprawnością, szkoły.',
    },
    {
      label: 'Składowe',
      value:
        'Prosta mapa internetowa, formularz zgłoszenia ze zdjęciem, instrukcja oznaczania barier, coroczny raport dla gminy.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 3 tys. zł rocznie. Pracownik urzędu na kilka godzin w miesiącu i grupa mieszkańców zbierających zgłoszenia.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Zgłoś się do autora po dostęp do mapy, przeszkol kilku mieszkańców, a raport przekaż wójtowi przed planowaniem budżetu.',
    },
  ],
  materials: [
    'Instrukcja oznaczania barier (PDF, 1,8 MB)',
    'Wzór raportu rocznego dla gminy (DOCX, 120 KB)',
  ],
  steps: [
    'Poproś radę osób z niepełnosprawnością o wskazanie dziesięciu miejsc do sprawdzenia na początek.',
    'Zbierz grupę mieszkańców i pokaż im, jak dodawać zgłoszenia na mapie.',
    'Co kwartał wyeksportuj listę barier i przekaż ją referatowi inwestycji.',
    'Zaznaczaj na mapie naprawione miejsca, żeby mieszkańcy widzieli efekty.',
  ],
  fundingProgrammes: ['Fundusz Dostępności Przestrzeni (przykład)'],
  fundingNote:
    'Sprawdzono 01.2026. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '4 – pomogło · urząd gminy, gmina miejsko-wiejska',
      quote:
        'Dostaliśmy w jedną zimę więcej zgłoszeń niż przez cały poprzedni rok.',
    },
    {
      heading: '4 – pomogło · NGO, miasto',
      quote: 'Mapa działa, o ile ktoś w urzędzie odpowiada na zgłoszenia.',
    },
  ],
};

export const pracaNaProbe: Innovation = {
  id: 'praca-na-probe',
  name: 'Praca na Próbę',
  area: 'Niepełnosprawność',
  kind: 'metoda',
  category: 'Niepełnosprawność · metoda',
  summary:
    'Dwutygodniowe płatne próby pracy u lokalnych pracodawców ze wsparciem trenera.',
  verified: '09.2025',
  cost: 'ok. 20–35 tys. zł / rok',
  costBand: 'mid',
  seeksTesters: false,
  hasVideo: false,
  author: 'Spółdzielnia Socjalna Nowy Początek',
  incubator: 'Małopolski Inkubator Usług Społecznych „Pomost”',
  rating: '4,5',
  reviewCount: 8,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Pracodawcy obawiają się zatrudniać osoby z niepełnosprawnością, bo nie wiedzą, jak będzie wyglądała ich praca.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Osoby z niepełnosprawnością w wieku produkcyjnym, bez doświadczenia zawodowego lub po długiej przerwie.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'GOPS, powiatowe urzędy pracy, zakłady aktywności zawodowej, spółdzielnie socjalne.',
    },
    {
      label: 'Składowe',
      value:
        'Lista chętnych pracodawców, umowa o próbę, stypendium dla uczestnika, trener pracy, ocena po zakończeniu próby.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 20–35 tys. zł rocznie. Trener pracy na pół etatu i koordynator po stronie gminy.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz wzór umowy i kartę oceny, umów się z kilkoma pracodawcami, poproś autora o konsultację dla trenera.',
    },
  ],
  materials: [
    'Wzór umowy o próbę pracy (DOCX, 88 KB)',
    'Karta oceny próby (PDF, 210 KB)',
    'Poradnik dla pracodawcy (PDF, 1,6 MB)',
  ],
  steps: [
    'Spotkaj się z pięcioma lokalnymi pracodawcami i opowiedz o zasadach próby.',
    'Wskaż w GOPS osoby, które chcą spróbować pracy, i omów z nimi oczekiwania.',
    'Zatrudnij trenera pracy, który będzie towarzyszył uczestnikom w pierwszych dniach.',
    'Po dwóch tygodniach omów wyniki z pracodawcą i uczestnikiem oraz ustal dalsze kroki.',
  ],
  fundingProgrammes: [
    'FERS – aktywizacja zawodowa',
    'Lokalny Program Zatrudnienia Wspomaganego (przykład)',
  ],
  fundingNote:
    'Sprawdzono 09.2025. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '5 – bardzo pomogło · GOPS, gmina wiejska',
      quote: 'Z ośmiu prób cztery zakończyły się propozycją umowy o pracę.',
    },
    {
      heading: '4 – pomogło · powiatowy urząd pracy, powiat',
      quote:
        'Pracodawcy przestali się bać, gdy zobaczyli, że trener jest na miejscu.',
    },
  ],
};
