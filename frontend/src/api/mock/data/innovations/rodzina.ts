import type { Innovation } from '../../../types';

export const wytchnieniowaSobota: Innovation = {
  id: 'wytchnieniowa-sobota',
  name: 'Wytchnieniowa Sobota',
  area: 'Rodzina i opiekunowie',
  kind: 'usługa',
  category: 'Rodzina i opiekunowie · usługa',
  summary:
    'Raz w miesiącu opiekunowie zostawiają bliskich pod fachową opieką i mają dzień dla siebie.',
  verified: '06.2026',
  cost: 'ok. 25–40 tys. zł / rok',
  costBand: 'mid',
  seeksTesters: true,
  hasVideo: true,
  author: 'Stowarzyszenie Opiekuńcze Pod Dachem',
  incubator: 'Inkubator Innowacji Społecznych „Most”',
  rating: '4,8',
  reviewCount: 11,
  testerNote: 'Zostało 3 miejsca dla testerów · do 15.12.2026',
  facts: [
    {
      label: 'Problem',
      value:
        'Opiekunowie osób zależnych nie mają ani jednego dnia odpoczynku w miesiącu i wypalają się szybciej, niż myślą.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Opiekunowie rodzinni osób starszych i osób z niepełnosprawnością oraz ich podopieczni.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'GOPS, centra usług społecznych, domy dziennego pobytu, organizacje opiekuńcze.',
    },
    {
      label: 'Składowe',
      value:
        'Sala w świetlicy lub domu dziennego, zespół opiekunów, posiłek, zajęcia dla podopiecznych, zapisy z wyprzedzeniem.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 25–40 tys. zł rocznie. Dwie opiekunki na dyżur, pielęgniarka na telefon i koordynator na 1/4 etatu.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz opis organizacji dnia, wskaż salę i opiekunki, zapytaj autora o wizytę w działającym punkcie.',
    },
  ],
  materials: [
    'Opis organizacji dnia opieki (PDF, 1,2 MB)',
    'Karta informacyjna o podopiecznym (DOCX, 70 KB)',
  ],
  steps: [
    'Sprawdź w GOPS, ilu opiekunów rodzinnych prosi o chwilę odpoczynku.',
    'Wybierz salę z dostępem do toalety i kuchni, na przykład w świetlicy wiejskiej.',
    'Zatrudnij opiekunki na sobotnie dyżury i przeszkol je z materiałów autora.',
    'Zbierz od rodzin karty informacyjne i poznaj podopiecznych przed pierwszą sobotą.',
  ],
  fundingProgrammes: [
    'Program Wsparcia Opiekunów Rodzinnych (przykład)',
    'FERS – usługi społeczne',
  ],
  fundingNote:
    'Sprawdzono 06.2026. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '5 – bardzo pomogło · GOPS, gmina wiejska',
      quote:
        'Jedna z opiekunek po raz pierwszy od trzech lat poszła do fryzjera.',
    },
    {
      heading: '5 – bardzo pomogło · stowarzyszenie, gmina miejsko-wiejska',
      quote: 'Najtrudniej było znaleźć salę bez schodów, reszta poszła gładko.',
    },
  ],
};

export const kragOpiekunow: Innovation = {
  id: 'krag-opiekunow',
  name: 'Krąg Opiekunów',
  area: 'Rodzina i opiekunowie',
  kind: 'metoda',
  category: 'Rodzina i opiekunowie · metoda',
  summary:
    'Grupa samopomocowa opiekunów rodzinnych prowadzona według gotowego scenariusza spotkań.',
  verified: '12.2025',
  cost: 'ok. 6 tys. zł / rok',
  costBand: 'low',
  seeksTesters: false,
  hasVideo: false,
  author: 'Fundacja Opiekun Też Człowiek',
  incubator: 'Pracownia Wdrożeń Społecznych „Żuraw”',
  rating: '4,2',
  reviewCount: 5,
  testerNote: '',
  facts: [
    {
      label: 'Problem',
      value:
        'Opiekunowie czują się osamotnieni ze swoimi trudnościami i nie wiedzą, gdzie szukać rad od osób w podobnej sytuacji.',
    },
    {
      label: 'Grupa docelowa',
      value:
        'Dorosłe dzieci i małżonkowie, którzy na co dzień opiekują się chorym lub niesamodzielnym bliskim.',
    },
    {
      label: 'Kto może skorzystać',
      value:
        'GOPS, ośrodki zdrowia, parafie, biblioteki, koła gospodyń wiejskich.',
    },
    {
      label: 'Składowe',
      value:
        'Cykl dziesięciu spotkań, scenariusz dla moderatora, ćwiczenia, lista kontaktów do instytucji wsparcia.',
    },
    {
      label: 'Koszt i kadra',
      value:
        'Ok. 6 tys. zł rocznie. Moderator z doświadczeniem w pracy z grupą i sala raz na dwa tygodnie.',
    },
    {
      label: 'Jak skorzystać',
      value:
        'Pobierz scenariusz, wybierz moderatora, ogłoś nabór i poproś autora o szkolenie online dla prowadzącego.',
    },
  ],
  materials: [
    'Scenariusz dziesięciu spotkań (PDF, 2,4 MB)',
    'Lista kontaktów do instytucji wsparcia (DOCX, 55 KB)',
  ],
  steps: [
    'Wybierz moderatora, który ma doświadczenie w prowadzeniu grup, na przykład pracownika socjalnego.',
    'Znajdź salę w bibliotece lub parafii i ustal stały termin spotkań.',
    'Zaproś opiekunów osobiście, przez lekarza rodzinnego i pielęgniarki środowiskowe.',
    'Po dziesiątym spotkaniu zapytaj grupę, czy chce działać dalej bez udziału moderatora.',
  ],
  fundingProgrammes: ['Gminny Program Wspierania Rodziny (przykład)'],
  fundingNote:
    'Sprawdzono 12.2025. Sprawdź aktualne nabory. Hub nie gwarantuje dofinansowania.',
  reviews: [
    {
      heading: '4 – pomogło · GOPS, gmina wiejska',
      quote:
        'Ludzie przychodzą nie po porady, tylko po to, żeby ktoś ich wysłuchał.',
    },
    {
      heading: '4 – pomogło · biblioteka, gmina miejsko-wiejska',
      quote: 'Na początek przyszły cztery osoby, ale grupa trwa już drugi rok.',
    },
  ],
};
