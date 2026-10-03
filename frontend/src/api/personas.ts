import type { Persona, PersonaId } from './types';

export const PERSONAS: Readonly<Record<PersonaId, Persona>> = {
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

export const PERSONA_IDS: readonly PersonaId[] = ['ewa', 'maria', 'anna'];
