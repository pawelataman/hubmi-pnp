import type { NeedsProfile } from './types';

export const NEEDS_PROFILE_KEY: string = 'hubme.needsProfile.v1';
export const MIN_DESCRIPTION_LENGTH: number = 60;
export const MAX_DESCRIPTION_LENGTH: number = 4000;

export interface NeedsProfileDraft {
  readonly displayName: string;
  readonly description: string;
  readonly municipality: string;
}

export type NeedsProfileField = keyof NeedsProfileDraft;
export type NeedsProfileErrors = Readonly<
  Record<NeedsProfileField, string | null>
>;

export const EMPTY_PROFILE_ERRORS: NeedsProfileErrors = {
  displayName: null,
  description: null,
  municipality: null,
};

export type ProfileValidation =
  | { readonly valid: true; readonly profile: NeedsProfile }
  | { readonly valid: false; readonly errors: NeedsProfileErrors };

export interface StoredNeedsProfile {
  readonly profile: NeedsProfile | null;
  readonly error: string | null;
}

export function validateNeedsProfile(
  draft: NeedsProfileDraft,
): ProfileValidation {
  const displayName: string = draft.displayName.trim();
  const description: string = draft.description.trim();
  const municipality: string = draft.municipality.trim();
  const errors: NeedsProfileErrors = {
    displayName:
      displayName.length < 2 || displayName.length > 80
        ? 'Podaj imię lub pseudonim od 2 do 80 znaków.'
        : null,
    description:
      description.length < MIN_DESCRIPTION_LENGTH
        ? 'Napisz 2–3 zdania o swojej sytuacji i potrzebach (minimum 60 znaków).'
        : description.length > MAX_DESCRIPTION_LENGTH
          ? 'Skróć opis do 4000 znaków.'
          : null,
    municipality:
      municipality.length > 120
        ? 'Skróć nazwę miejscowości do 120 znaków.'
        : null,
  };
  if (
    Object.values(errors).some(
      (error: string | null): boolean => error !== null,
    )
  ) {
    return { valid: false, errors };
  }
  return {
    valid: true,
    profile: {
      personType: 'beneficiary',
      displayName,
      description,
      municipality,
    },
  };
}

function decodeNeedsProfile(value: unknown): NeedsProfile | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !('personType' in value) ||
    value.personType !== 'beneficiary' ||
    !('displayName' in value) ||
    typeof value.displayName !== 'string' ||
    !('description' in value) ||
    typeof value.description !== 'string' ||
    !('municipality' in value) ||
    typeof value.municipality !== 'string'
  ) {
    return null;
  }
  const result: ProfileValidation = validateNeedsProfile({
    displayName: value.displayName,
    description: value.description,
    municipality: value.municipality,
  });
  return result.valid ? result.profile : null;
}

export function readNeedsProfile(): StoredNeedsProfile {
  try {
    const raw: string | null = window.localStorage.getItem(NEEDS_PROFILE_KEY);
    if (raw === null) {
      return { profile: null, error: null };
    }
    const decoded: unknown = JSON.parse(raw);
    const profile: NeedsProfile | null = decodeNeedsProfile(decoded);
    return profile === null
      ? {
          profile: null,
          error: 'Zapisany profil jest nieprawidłowy. Uzupełnij go ponownie.',
        }
      : { profile, error: null };
  } catch (error: unknown) {
    return {
      profile: null,
      error:
        error instanceof SyntaxError
          ? 'Nie udało się odczytać zapisanego profilu. Uzupełnij go ponownie.'
          : 'Przeglądarka nie pozwala odczytać profilu. Sprawdź ustawienia zapisywania danych.',
    };
  }
}

/** Validates and persists before the caller updates its in-memory session. */
export function writeNeedsProfile(profile: NeedsProfile): void {
  const result: ProfileValidation = validateNeedsProfile(profile);
  if (!result.valid) {
    throw new Error('Profil zawiera nieprawidłowe dane.');
  }
  try {
    window.localStorage.setItem(
      NEEDS_PROFILE_KEY,
      JSON.stringify(result.profile),
    );
  } catch (error: unknown) {
    throw new Error(
      'Nie udało się zapisać profilu. Sprawdź ustawienia zapisywania danych w przeglądarce.',
      { cause: error },
    );
  }
}
