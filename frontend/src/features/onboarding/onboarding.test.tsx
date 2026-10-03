import { cleanup, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NEEDS_PROFILE_KEY } from '../../api/needsProfile';
import type { NeedsProfile, PersonType } from '../../api/types';
import { renderApp, type RenderedApp } from '../../test/renderApp';

const PROFILE: NeedsProfile = {
  personType: 'beneficiary',
  displayName: 'Jan',
  description:
    'Mieszkam sam i brakuje mi codziennych rozmów z ludźmi. Szukam kontaktu przez zwykły telefon, bo nie korzystam ze smartfona.',
  municipality: 'Jodłowa Wola',
};

async function completeExample(): Promise<RenderedApp> {
  const app: RenderedApp = renderApp('/onboarding');
  await app.user.click(
    screen.getByRole('button', { name: 'Wypełnij przykładem Jana' }),
  );
  await app.user.click(
    screen.getByRole('button', {
      name: 'Zapisz profil i znajdź rozwiązania →',
    }),
  );
  await screen.findByRole('heading', { name: 'Sprawdź, czy dobrze rozumiemy' });
  await screen.findByRole('button', { name: 'Popraw streszczenie' });
  return app;
}

describe('onboarding', (): void => {
  afterEach((): void => {
    vi.restoreAllMocks();
  });

  it('opens from the public sign-up link', async (): Promise<void> => {
    const { user, router } = renderApp('/');
    await user.click(screen.getByRole('link', { name: 'Załóż konto' }));
    expect(router.state.location.pathname).toBe('/onboarding');
    expect(screen.getByRole('combobox', { name: 'Typ osoby' })).toHaveValue(
      'beneficiary',
    );
    expect(
      screen.getByRole('textbox', { name: 'Twoja sytuacja i potrzeby' }),
    ).toHaveValue('');
  });

  it.each<PersonType>(['innovator', 'institution', 'expert'])(
    'shows a pending form for %s and preserves the beneficiary draft',
    async (personType: PersonType): Promise<void> => {
      const { user } = renderApp('/onboarding');
      await user.type(
        screen.getByRole('textbox', { name: 'Imię lub pseudonim' }),
        'Jan',
      );
      await user.selectOptions(
        screen.getByRole('combobox', { name: 'Typ osoby' }),
        personType,
      );
      expect(
        screen.getByRole('heading', { name: 'Formularz w przygotowaniu' }),
      ).toBeInTheDocument();
      expect(screen.getByText('To be developed')).toBeInTheDocument();
      expect(
        screen.queryByRole('textbox', { name: 'Twoja sytuacja i potrzeby' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: 'Zapisz profil i znajdź rozwiązania →',
        }),
      ).not.toBeInTheDocument();
      expect(window.localStorage.getItem(NEEDS_PROFILE_KEY)).toBeNull();
      await user.click(
        screen.getByRole('button', { name: 'Wybierz osobę potrzebującą' }),
      );
      expect(
        screen.getByRole('textbox', { name: 'Imię lub pseudonim' }),
      ).toHaveValue('Jan');
    },
  );

  it('validates the profile and focuses the first invalid field', async (): Promise<void> => {
    const { user, router } = renderApp('/onboarding');
    await user.click(
      screen.getByRole('button', {
        name: 'Zapisz profil i znajdź rozwiązania →',
      }),
    );
    expect(
      screen.getByRole('textbox', { name: 'Imię lub pseudonim' }),
    ).toHaveFocus();
    expect(screen.getByText(/minimum 60 znaków/)).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/onboarding');
    expect(window.localStorage.getItem(NEEDS_PROFILE_KEY)).toBeNull();
  });

  it('saves the account and uses its actual description in a personal matchmaking flow', async (): Promise<void> => {
    const { user } = await completeExample();
    expect(
      screen.getByRole('button', { name: 'Konto: Jan' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Mam 68 lat i mieszkam sam/)).toBeInTheDocument();
    expect(screen.queryByText('Kto miałby wdrażać?')).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem('hubme.persona')).toBe('beneficiary');
    const raw: string | null = window.localStorage.getItem(NEEDS_PROFILE_KEY);
    expect(raw).toContain('Mam 68 lat');
    await user.click(
      screen.getByRole('button', { name: 'Szukaj rozwiązań →' }),
    );
    expect(
      await screen.findByRole('heading', {
        name: 'Innowacje dopasowane do Twoich potrzeb',
      }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Regularne rozmowy z wolontariuszem/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: '3. Skala w Twojej gminie' }),
    ).not.toBeInTheDocument();
  });

  it('uses the personal answers to order the POC recommendations', async (): Promise<void> => {
    const { user } = await completeExample();
    await user.click(
      within(
        screen.getByRole('group', { name: 'Co najbardziej by Ci pomogło?' }),
      ).getByRole('button', { name: 'Kontakt online' }),
    );
    await user.click(
      screen.getByRole('button', { name: 'Szukaj rozwiązań →' }),
    );
    await screen.findByRole('heading', { name: 'Cyfrowy Wnuk' });
    const first: HTMLElement | undefined = screen.getAllByRole('article')[0];
    expect(first).toBeDefined();
    if (first === undefined) {
      throw new Error('Missing recommendation card');
    }
    expect(
      within(first).getByRole('heading', { name: 'Cyfrowy Wnuk' }),
    ).toBeInTheDocument();
  });

  it('restores the profile after remount and lets the user edit it', async (): Promise<void> => {
    window.localStorage.setItem(NEEDS_PROFILE_KEY, JSON.stringify(PROFILE));
    renderApp('/onboarding', { persona: 'beneficiary' });
    expect(
      screen.getByRole('textbox', { name: 'Imię lub pseudonim' }),
    ).toHaveValue('Jan');
    expect(
      screen.getByRole('textbox', { name: 'Twoja sytuacja i potrzeby' }),
    ).toHaveValue(PROFILE.description);
    cleanup();
    const { user } = renderApp('/znajdz/doprecyzowanie');
    expect(
      await screen.findByText(/Mieszkam sam i brakuje mi codziennych rozmów/),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Konto: Jan' }));
    await user.click(
      screen.getByRole('menuitem', { name: 'Mój profil potrzeb' }),
    );
    const name: HTMLElement = screen.getByRole('textbox', {
      name: 'Imię lub pseudonim',
    });
    await user.clear(name);
    await user.type(name, 'Janek');
    await user.click(
      screen.getByRole('button', {
        name: 'Zapisz profil i znajdź rozwiązania →',
      }),
    );
    expect(
      await screen.findByRole('button', { name: 'Konto: Janek' }),
    ).toBeInTheDocument();
    expect(window.localStorage.getItem(NEEDS_PROFILE_KEY)).toContain('Janek');
  });

  it('keeps the saved profile out of another demo account’s matchmaking flow', async (): Promise<void> => {
    window.localStorage.setItem(NEEDS_PROFILE_KEY, JSON.stringify(PROFILE));
    const { user } = renderApp('/', { persona: 'beneficiary' });
    expect(screen.getByRole('textbox', { name: 'Opisz problem' })).toHaveValue(
      PROFILE.description,
    );
    await user.click(screen.getByRole('button', { name: 'Konto: Jan' }));
    await user.click(screen.getByRole('menuitem', { name: 'Zmień osobę' }));
    await user.click(screen.getByRole('button', { name: /Ewa W\./ }));
    expect(
      screen.getByRole('textbox', { name: 'Opisz problem' }),
    ).not.toHaveValue(PROFILE.description);
    expect(window.localStorage.getItem(NEEDS_PROFILE_KEY)).toContain(
      PROFILE.description,
    );
  });

  it('reports a storage failure without navigating or creating the account', async (): Promise<void> => {
    const { user, router } = renderApp('/onboarding');
    await user.click(
      screen.getByRole('button', { name: 'Wypełnij przykładem Jana' }),
    );
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((): never => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    await user.click(
      screen.getByRole('button', {
        name: 'Zapisz profil i znajdź rozwiązania →',
      }),
    );
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nie udało się zapisać profilu.',
    );
    expect(router.state.location.pathname).toBe('/onboarding');
    expect(
      screen.queryByRole('button', { name: 'Konto: Jan' }),
    ).not.toBeInTheDocument();
  });

  it('handles malformed saved data and offers a fresh form', (): void => {
    window.localStorage.setItem(NEEDS_PROFILE_KEY, '{broken json');
    renderApp('/onboarding', { persona: 'beneficiary' });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Nie udało się odczytać zapisanego profilu.',
    );
    expect(
      screen.getByRole('textbox', { name: 'Imię lub pseudonim' }),
    ).toHaveValue('');
    expect(
      screen.getByRole('button', { name: 'Zaloguj się' }),
    ).toBeInTheDocument();
  });
});
