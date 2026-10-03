export interface StoredProfile<T> {
  readonly profile: T | null;
  readonly error: string | null;
}

export function readProfile<T>(
  key: string,
  decode: (value: unknown) => T | null,
): StoredProfile<T> {
  try {
    const raw: string | null = window.localStorage.getItem(key);
    if (raw === null) {
      return { profile: null, error: null };
    }
    const decoded: unknown = JSON.parse(raw);
    const profile: T | null = decode(decoded);
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

export function writeProfile(key: string, profile: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(profile));
  } catch (error: unknown) {
    throw new Error(
      'Nie udało się zapisać profilu. Sprawdź ustawienia zapisywania danych w przeglądarce.',
      { cause: error },
    );
  }
}
