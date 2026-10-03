export interface NavItem {
  readonly label: string;
  readonly to: string;
  /** Path prefixes, besides `to` itself, that mark this item active. */
  readonly prefixes: readonly string[];
}

export const TOP_NAV: readonly NavItem[] = [
  { label: 'Znajdź rozwiązanie', to: '/', prefixes: ['/znajdz'] },
  {
    label: 'Biblioteka innowacji',
    to: '/biblioteka',
    prefixes: ['/innowacje'],
  },
  { label: 'Wyzwania Małopolski', to: '/wyzwania', prefixes: [] },
  { label: 'Zgłoś pomysł', to: '/zglos-pomysl', prefixes: [] },
  { label: 'Nabory', to: '/nabory', prefixes: [] },
];

export const SIDE_NAV: readonly NavItem[] = [
  { label: 'Pulpit', to: '/rops/pulpit', prefixes: [] },
  {
    label: 'Kolejka zgłoszeń',
    to: '/rops/kolejka',
    prefixes: ['/rops/kolejka/'],
  },
  { label: 'Innowacje', to: '/rops/innowacje', prefixes: [] },
  { label: 'Nabory', to: '/rops/nabory', prefixes: [] },
  { label: 'Trendy potrzeb', to: '/rops/trendy', prefixes: [] },
  { label: 'Eksperci i użytkownicy', to: '/rops/eksperci', prefixes: [] },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  return (
    pathname === item.to ||
    item.prefixes.some((prefix: string): boolean => pathname.startsWith(prefix))
  );
}

/** The AI notice band is drawn on M1–M4, Z2, MW1 and MW2 only. */
export function showsAiNotice(pathname: string): boolean {
  return (
    pathname === '/' ||
    pathname.startsWith('/znajdz') ||
    pathname.startsWith('/innowacje')
  );
}

const GUARDED_ADAPTATION: RegExp = /^\/innowacje\/[^/]+\/(dostosuj|szkic)$/;

/** Pages of the public layout that only a signed-in persona can see. */
export function requiresPersona(pathname: string): boolean {
  return (
    pathname === '/moje-sprawy' ||
    pathname.startsWith('/moje-sprawy/') ||
    GUARDED_ADAPTATION.test(pathname)
  );
}

export const STUB_TITLES: Readonly<Record<string, string>> = {
  '/biblioteka': 'Biblioteka innowacji',
  '/wyzwania': 'Wyzwania Małopolski',
  '/nabory': 'Nabory',
  '/kontakt': 'Kontakt z ROPS',
  '/dostepnosc': 'Deklaracja dostępności',
  '/jak-dziala-ai': 'Jak działa AI w HubMe',
  '/ustawienia-powiadomien': 'Ustawienia powiadomień',
  '/rops/pulpit': 'Pulpit',
  '/rops/innowacje': 'Innowacje',
  '/rops/nabory': 'Nabory',
  '/rops/eksperci': 'Eksperci i użytkownicy',
};
