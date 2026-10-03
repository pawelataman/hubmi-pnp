import {
  readProfile,
  writeProfile,
  type StoredProfile,
} from './profileStorage';
import type { ExpertProfile, ExpertiseDomain } from './types';

export const EXPERT_PROFILE_KEY: string = 'hubme.expertProfile.v1';
export const MAX_EXPERT_DESCRIPTION_LENGTH: number = 4000;

export interface ExpertiseOption {
  readonly value: ExpertiseDomain;
  readonly label: string;
}

export const EXPERTISE_DOMAINS: readonly ExpertiseOption[] = [
  { value: 'senior-support', label: 'Wsparcie seniorów i dobrostan' },
  { value: 'digital-inclusion', label: 'Dostępność i włączenie cyfrowe' },
  { value: 'community', label: 'Integracja społeczna i wolontariat' },
  {
    value: 'service-design',
    label: 'Projektowanie i rozwój usług społecznych',
  },
];

export function isExpertiseDomain(value: string): value is ExpertiseDomain {
  return EXPERTISE_DOMAINS.some(
    (option: ExpertiseOption): boolean => option.value === value,
  );
}

export function expertiseLabel(domain: ExpertiseDomain): string {
  return (
    EXPERTISE_DOMAINS.find(
      (option: ExpertiseOption): boolean => option.value === domain,
    )?.label ?? domain
  );
}

export interface ExpertProfileDraft {
  readonly displayName: string;
  readonly profession: string;
  readonly domain: ExpertiseDomain | '';
  readonly description: string;
}

export type ExpertProfileField = keyof ExpertProfileDraft;
export type ExpertProfileErrors = Readonly<
  Record<ExpertProfileField, string | null>
>;
export const EMPTY_EXPERT_ERRORS: ExpertProfileErrors = {
  displayName: null,
  profession: null,
  domain: null,
  description: null,
};

export type ExpertProfileValidation =
  | { readonly valid: true; readonly profile: ExpertProfile }
  | { readonly valid: false; readonly errors: ExpertProfileErrors };

export function validateExpertProfile(
  draft: ExpertProfileDraft,
): ExpertProfileValidation {
  const displayName: string = draft.displayName.trim();
  const profession: string = draft.profession.trim();
  const description: string = draft.description.trim();
  const errors: ExpertProfileErrors = {
    displayName:
      displayName.length < 2 || displayName.length > 80
        ? 'Podaj imię lub pseudonim od 2 do 80 znaków.'
        : null,
    profession:
      profession.length < 3 || profession.length > 120
        ? 'Opisz swój zawód lub rolę w 3–120 znakach.'
        : null,
    domain: isExpertiseDomain(draft.domain)
      ? null
      : 'Wybierz dziedzinę ekspertyzy.',
    description:
      description.length < 60
        ? 'Napisz 2–3 zdania o doświadczeniu i kompetencjach (minimum 60 znaków).'
        : description.length > MAX_EXPERT_DESCRIPTION_LENGTH
          ? 'Skróć opis do 4000 znaków.'
          : null,
  };
  if (
    Object.values(errors).some(
      (error: string | null): boolean => error !== null,
    ) ||
    !isExpertiseDomain(draft.domain)
  ) {
    return { valid: false, errors };
  }
  return {
    valid: true,
    profile: {
      personType: 'expert',
      displayName,
      profession,
      domain: draft.domain,
      description,
    },
  };
}

function decodeExpertProfile(value: unknown): ExpertProfile | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('personType' in value) ||
    value.personType !== 'expert' ||
    !('displayName' in value) ||
    typeof value.displayName !== 'string' ||
    !('profession' in value) ||
    typeof value.profession !== 'string' ||
    !('domain' in value) ||
    typeof value.domain !== 'string' ||
    !isExpertiseDomain(value.domain) ||
    !('description' in value) ||
    typeof value.description !== 'string'
  ) {
    return null;
  }
  const result: ExpertProfileValidation = validateExpertProfile({
    displayName: value.displayName,
    profession: value.profession,
    domain: value.domain,
    description: value.description,
  });
  return result.valid ? result.profile : null;
}

export function readExpertProfile(): StoredProfile<ExpertProfile> {
  return readProfile(EXPERT_PROFILE_KEY, decodeExpertProfile);
}

export function writeExpertProfile(profile: ExpertProfile): void {
  const result: ExpertProfileValidation = validateExpertProfile(profile);
  if (!result.valid) {
    throw new Error('Profil eksperta zawiera nieprawidłowe dane.');
  }
  writeProfile(EXPERT_PROFILE_KEY, result.profile);
}
