import type { IdeaForm, IdeaStage } from './types';

export const EXAMPLE_DESCRIPTION: string =
  'W naszej gminie wielu starszych ludzi mieszka samotnie, dzieci wyjechały do pracy za granicę. Pani Janina z Jodłowej Woli (tel. 600 123 456) od zawału prawie nie wychodzi z domu, a jej syn Marek jest w Niemczech. Nie ma transportu do miasta i poza listonoszem nikt ich nie odwiedza.';

export const EXAMPLE_MUNICIPALITY: string = 'Jodłowa Wola, pow. tarnowski';

export const EXAMPLE_PROMPTS: readonly string[] = [
  'Starsi sąsiedzi mieszkają sami i nie mają z kim porozmawiać',
  'Młodzież po szkole nie ma gdzie się spotykać',
  'Rodzice dzieci z niepełnosprawnością nie mają chwili wytchnienia',
];

export const IDEA_STAGES: readonly IdeaStage[] = [
  'Pomysł',
  'Prototyp',
  'Testowane w mikroskali',
  'Działa',
];

export const EXAMPLE_IDEA: IdeaForm = {
  name: 'Sąsiedzka kawiarenka',
  summary:
    'Raz w tygodniu w remizie seniorzy i młodzi piją kawę i uczą się od siebie nawzajem.',
  audience: 'Seniorzy i młodzież ze wsi',
  problem: 'Samotność, brak miejsc spotkań',
  stage: 'Prototyp',
  email: 'm.nowak@przyklad.pl',
};

export const BUDGET_OPTIONS: readonly string[] = [
  'do 10 tys. zł',
  '10–30 tys. zł',
  '30–60 tys. zł',
  'ponad 60 tys. zł',
  'Nie wiem',
];

export const RESOURCE_OPTIONS: readonly string[] = [
  'Lokal (świetlica)',
  'Transport',
  'KGW',
  'OSP',
  'Parafia',
  'Szkoła',
];

/** Form values as strings, as the MW1 form holds them. */
export interface ProfileDraft {
  readonly municipality: string;
  readonly audience: string;
  readonly recipients: string;
  readonly budget: string;
  readonly staff: string;
  readonly resources: readonly string[];
}

export const EXAMPLE_PROFILE: ProfileDraft = {
  municipality: 'Jodłowa Wola',
  audience: 'Seniorzy 65+ mieszkający samotnie',
  recipients: '40',
  budget: '10–30 tys. zł',
  staff: '1 pracownik socjalny na część etatu, asystent rodziny',
  resources: ['Lokal (świetlica)', 'KGW', 'OSP', 'Szkoła'],
};
