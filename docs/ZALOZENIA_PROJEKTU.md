# Ogólny szablon założeń projektu

Na podstawie wyzwania dotyczącego Małopolskiego Hubu Innowacji Społecznych.
Dokument opisuje oczekiwania wobec projektu, bez narzucania technologii ani
konkretnego sposobu implementacji.

## 1. Cel projektu

Stworzyć intuicyjną platformę wykorzystującą sztuczną inteligencję, która pomaga
łączyć realne potrzeby społeczne z istniejącymi innowacjami oraz wspiera współpracę
mieszkańców, instytucji i ekspertów.

Platforma powinna usprawniać pracę Hubu: ograniczać czynności administracyjne,
ułatwiać dostęp do wiedzy i przyspieszać wdrażanie sprawdzonych rozwiązań.

**Główna obietnica produktu:** użytkownik opisuje problem własnymi słowami
i otrzymuje propozycje innowacji odpowiadających na jego potrzebę.

## 2. Problem, który rozwiązujemy

Wiedza, inicjatywy i rozwiązania społeczne są rozproszone. Osobom i instytucjom
trudno odnaleźć istniejące rozwiązania, a autorom pomysłów — dotrzeć do odbiorców,
partnerów i wsparcia. Hub potrzebuje narzędzia porządkującego te zasoby
i ułatwiającego ich wykorzystanie w całym regionie.

Przykładowe obszary potrzeb to samotność, starzenie się społeczeństwa, zdrowie
psychiczne, wykluczenie cyfrowe i dostęp do usług społecznych.

## 3. Odbiorcy i ich potrzeby

| Grupa | Główna potrzeba |
| --- | --- |
| Mieszkańcy i organizacje pozarządowe | Łatwo zgłosić problem lub pomysł, znaleźć wsparcie i uzyskać odpowiedź. |
| Samorządy i instytucje lokalne | Znaleźć gotowe innowacje i dostosować je do lokalnych potrzeb. |
| Pracownicy ROPS / Hubu | Zarządzać wiedzą, weryfikować zgłoszenia i prowadzić komunikację. |
| Eksperci i mentorzy | Doradzać, przekazywać informacje zwrotne i budować partnerstwa. |

## 4. Obowiązkowy rdzeń funkcjonalny

**Matchmaking społeczny — inteligentne dopasowanie problemu do rozwiązania.**

Użytkownik opisuje swoją potrzebę, a system automatycznie:

- wyszukuje podobne przypadki lub informacje dotyczące problemu;
- proponuje istniejące rozwiązania i innowacje społeczne.

Projekt musi wykorzystać AI w sposób wspierający ten proces. Wyzwanie nie narzuca
konkretnego modelu, algorytmu ani dostawcy technologii.

**Proponowany minimalny scenariusz demonstracyjny:**

1. Użytkownik wpisuje opis problemu.
2. System analizuje opis i znajduje pasujące zasoby.
3. Użytkownik otrzymuje listę propozycji i otwiera szczegóły wybranej innowacji.

Warto dodać krótkie uzasadnienie dopasowania oraz wskazanie kolejnego kroku,
np. kontaktu z Hubem. Są to rekomendacje projektowe, a nie osobne wymagania
obowiązkowe z treści wyzwania.

## 5. Moduły dodatkowe

Każdy dodatkowo zrealizowany moduł jest premiowany. Nie trzeba implementować
wszystkich, aby dostarczyć wymagany prototyp.

| Moduł | Główne założenie |
| --- | --- |
| Zasobnik wiedzy | Udostępniać raporty, mapę wyzwań, bibliotekę innowacji i materiały edukacyjne; umożliwiać szybkie aktualizacje. Agregowane potrzeby i trendy są dostępne wyłącznie administratorowi. |
| Kreator pomysłów | Przyjmować krótkie fiszki pomysłów przez cały czas. Podczas naborów udostępniać formularze wniosków dostosowane do konkursu oraz materiały do prototypowania. Asystent AI rozwijający pomysł jest mile widziany. |
| Tester innowacji | Umożliwiać zgłoszenie udziału w testach, ocenę rozwiązania, przekazanie opinii i propozycji usprawnień. |
| Aktywna komunikacja | Zapewniać dialog z ROPS, kontakt z mentorami i budowanie partnerstw. |
| Panel administratora | Umożliwiać modyfikowanie, weryfikowanie i publikowanie wiedzy oraz obsługę zgłoszeń. |
| Middleman Innowacji | Wykorzystać asystenta AI do dostosowania innowacji do formy usługi odpowiadającej potrzebom instytucji. |

## 6. Założenia jakościowe i techniczne

- **Prostota:** użytkownik bez przygotowania technicznego powinien łatwo opisać
  problem i odnaleźć informacje.
- **Dostępność:** projektować z myślą o seniorach i osobach z niepełnosprawnościami;
  docelowe rozwiązanie musi spełniać WCAG 2.1 na poziomie AA.
- **Trafność:** rekomendacje powinny odpowiadać opisanej potrzebie.
- **Skalowalność:** przewidzieć obsługę danych z całego województwa i wielu
  użytkowników jednocześnie.
- **Rozbudowa i integracje:** umożliwić dodawanie modułów oraz przyszłą współpracę
  z systemami Hubu, np. bazą grantową.
- **Automatyzacja:** przewidzieć powiadomienia o nowych pomysłach i zmianach
  w naborach oraz sprawną ścieżkę odpowiedzi do autora.
- **Bezpieczeństwo:** uwzględnić ochronę danych i ograniczenie dostępu do funkcji
  administracyjnych. W projekcie nie wykorzystywać prawdziwych danych osobowych
  ani danych wrażliwych z materiałów ROPS.
- **Utrzymanie:** rozwiązanie powinno być proste w obsłudze i ekonomiczne
  w eksploatacji.

## 7. Zakres MVP na hackathon

MVP ma być działającym, interaktywnym prototypem pokazującym wartość produktu.
Obowiązkowo powinno demonstrować matchmaking społeczny. Dodatkowe moduły należy
wybrać zgodnie z możliwościami zespołu i czasem wydarzenia.

**Proponowany zakres podstawowy:** formularz opisu problemu, przykładowa baza
innowacji, działający mechanizm dopasowania, lista wyników i szczegóły innowacji.

Do demonstracji można wykorzystać dane przykładowe dostarczone przez organizatora.
Należy jasno opisać, które funkcje działają w prototypie, a które są planowane
do dalszego rozwoju.

## 8. Rezultaty do oddania

- Nazwa i opis rozwiązania.
- Funkcjonalny prototyp oraz link do działającego demo.
- Makiety UX/UI — minimum wymagana wizualizacja rozwiązania.
- Prezentacja PDF do 10 slajdów **lub** film do 3 minut.
- Przewidywany koszt obsługi i utrzymania oraz opis potrzebnych zasobów.

## 9. Kryteria sukcesu i oceny

Projekt powinien pokazać, że użytkownik łatwo zgłasza problem, otrzymuje trafne
propozycje i rozumie, jak z nich skorzystać. Przy realizacji komunikacji ważna jest
sprawna ścieżka powiadomienia administratora i odpowiedzi użytkownikowi.

| Kryterium konkursowe | Waga |
| --- | --- |
| Spełnienie wyzwania i działanie modułów | 40% — matchmaking 10%, każdy kolejny moduł +5% |
| Potencjał wdrożeniowy | 20% |
| Dostępność i intuicyjność prototypu | 20% |
| Atrakcyjność, pomysłowość i jakość interfejsu | 10% |
| Jakość materiałów i MVP | 10% |

## 10. Krótki szablon opisu własnej koncepcji

- **Nazwa projektu:** [nazwa]
- **Problem:** [konkretna potrzeba społeczna lub trudność w pracy Hubu]
- **Odbiorcy:** [grupy użytkowników i ich potrzeby]
- **Rozwiązanie:** [jak użytkownik przechodzi od problemu do pasującej innowacji]
- **Rola AI:** [co analizuje i jak pomaga w dopasowaniu]
- **Zakres MVP:** [matchmaking i wybrane moduły dodatkowe]
- **Wartość dla Hubu:** [jakie zadania usprawniamy]
- **Walidacja:** [jak pokażemy trafność wyników i łatwość obsługi]
- **Dalszy rozwój:** [integracje, skalowanie i kolejne funkcje]
- **Utrzymanie:** [przewidywane koszty i potrzebne zasoby]
