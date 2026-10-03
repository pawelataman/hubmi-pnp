import type { ExpertProfile, NeedsProfile, Persona, PersonaId } from './types';

export const PERSONAS: Readonly<Record<PersonaId, Persona>> = {
  expert: {
    id: 'expert',
    name: 'Osoba ekspercka',
    initials: 'EX',
    role: 'expert',
    description: 'Ekspert / mentor',
    threadRole: 'Ekspert',
  },
  beneficiary: {
    id: 'beneficiary',
    name: 'Osoba potrzebująca',
    initials: 'OP',
    role: 'user',
    description: 'Osoba potrzebująca',
    threadRole: 'Mieszkaniec',
  },
  ewa: {
    id: 'ewa',
    name: 'Ewa W.',
    initials: 'EW',
    role: 'user',
    description: 'Pracownica GOPS',
    threadRole: 'Pracownica GOPS',
  },
  maria: {
    id: 'maria',
    name: 'Maria N.',
    initials: 'MN',
    role: 'user',
    description: 'Autorka pomysłu',
    threadRole: 'Autorka pomysłu',
  },
  anna: {
    id: 'anna',
    name: 'Anna Kowalczyk',
    initials: 'AK',
    role: 'curator',
    description: 'Kuratorka ROPS',
    threadRole: 'ROPS',
  },
};

export const PERSONA_IDS: readonly PersonaId[] = [
  'beneficiary',
  'expert',
  'ewa',
  'maria',
  'anna',
];

export function getPersona(
  id: PersonaId,
  profile: NeedsProfile | null,
  expertProfile: ExpertProfile | null = null,
): Persona {
  const persona: Persona = PERSONAS[id];
  const accountProfile: NeedsProfile | ExpertProfile | null =
    id === 'beneficiary' ? profile : id === 'expert' ? expertProfile : null;
  if (accountProfile === null) {
    return persona;
  }
  return {
    ...persona,
    name: accountProfile.displayName,
    initials: accountProfile.displayName.slice(0, 2).toLocaleUpperCase('pl'),
  };
}
